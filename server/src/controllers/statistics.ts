// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Op, type WhereOptions, col, fn} from 'sequelize';

import {
  CourseRoleType,
  type CourseStatistics,
  type GlobalStatistics,
  HttpCode,
  SystemRole,
} from '@/common/types';
import Course from '../database/models/course';
import CoursePart from '../database/models/coursePart';
import CourseRole from '../database/models/courseRole';
import CourseTask from '../database/models/courseTask';
import CourseTranslation from '../database/models/courseTranslation';
import FinalGrade from '../database/models/finalGrade';
import GradingModel from '../database/models/gradingModel';
import TaskGrade from '../database/models/taskGrade';
import {ApiError, type Endpoint, type JwtClaims} from '../types';
import {validateCourseId} from './utils/course';

interface GlobalStatisticsQuery {
  courseIds?: string | string[];
  startDate?: string;
  endDate?: string;
  search?: string;
  grouping?: 'CALENDAR' | 'ACADEMIC' | 'COURSE';
}

interface TaskGradeAggregation {
  courseTaskId: number;
  submissionCount: number;
  averageGrade: number;
}

interface YearlyStatsData {
  totalStudents: Set<number>; // Students with grades
  totalEnrolled: Set<number>; // Students enrolled
  gradeSum: number;
  gradeCount: number;
  gradeDistribution: Record<string, number>;
  grades: number[]; // Array of all grades for median calculation
}

interface CourseStatsData {
  courseCode: string;
  name: {fi: string; en: string; sv: string};
  yearlyStats: Map<string | number, YearlyStatsData>;
}

// Helper function to calculate median
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

// Helper function to calculate pass/fail counts from grade distribution
const getPassFailCounts = (
  gradeDistribution: Record<string, number>,
): {passingCount: number; failingCount: number} => {
  const failingCount = gradeDistribution['0'] || 0;
  const totalCount = Object.values(gradeDistribution).reduce(
    (sum, count) => sum + count,
    0,
  );
  const passingCount = totalCount - failingCount;
  return {passingCount, failingCount};
};

// Helper function to calculate percentage with zero-check
const calculatePercentage = (numerator: number, denominator: number): number => {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
};

export const getGlobalStatistics: Endpoint<void, GlobalStatistics> = async (
  req,
  res,
) => {
  const query = req.query as GlobalStatisticsQuery;
  const courseIds =
    query.courseIds || (req.query as Record<string, unknown>)['courseIds[]'];
  const {startDate, endDate, search, grouping} = query;
  const user = req.user as JwtClaims;

  const whereClause: WhereOptions = {
    grade: {
      [Op.gte]: 0,
    },
  };

  // Date Filtering
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        Object.assign(whereClause.date, {[Op.gte]: start});
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        Object.assign(whereClause.date, {[Op.lte]: end});
      }
    }
  }

  // Access Control & Filtering Logic
  let availableIds: Set<number> | null = null;

  // 1. Role-based restriction
  if (user.role !== SystemRole.Admin) {
    const roles = await CourseRole.findAll({
      attributes: ['courseId'],
      where: {
        userId: user.id,
        role: {
          [Op.in]: [CourseRoleType.Teacher, CourseRoleType.Assistant],
        },
      },
    });
    availableIds = new Set(roles.map(r => r.courseId));
  }

  // 2. Search text filtering
  if (search) {
    const searchPattern = `%${search}%`;
    const [matchingTranslations, matchingCourses] = await Promise.all([
      CourseTranslation.findAll({
        attributes: ['courseId'],
        where: {courseName: {[Op.iLike]: searchPattern}},
      }),
      Course.findAll({
        attributes: ['id'],
        where: {courseCode: {[Op.iLike]: searchPattern}},
      }),
    ]);

    const foundIds = new Set([
      ...matchingTranslations.map(t => t.courseId),
      ...matchingCourses.map(c => c.id),
    ]);

    if (availableIds) {
      availableIds = new Set(
        [...availableIds].filter(id => foundIds.has(id)),
      );
    } else {
      availableIds = foundIds;
    }
  }

  // If we have restricted set and it's empty, return early
  if (availableIds?.size === 0) {
    return res.status(HttpCode.Ok).json({
      totalStudents: 0,
      totalEnrolled: 0,
      averageGrade: 0,
      medianGrade: 0,
      passingCount: 0,
      failingCount: 0,
      passRate: 0,
      completionRate: 0,
      totalActiveCourses: 0,
      yearlyStatistics: [],
      courseStatistics: [],
    });
  }

  // 3. Specific IDs request
  if (courseIds) {
    let requestedIds: number[] = [];
    if (Array.isArray(courseIds)) {
      requestedIds = courseIds.map(Number).filter(id => !Number.isNaN(id));
    } else if (typeof courseIds === 'string') {
      const id = Number(courseIds);
      if (!Number.isNaN(id)) requestedIds = [id];
    }

    if (availableIds) {
      const intersection = requestedIds.filter(id => availableIds.has(id));
      Object.assign(whereClause, {courseId: {[Op.in]: intersection}});
    } else if (requestedIds.length > 0) {
      Object.assign(whereClause, {courseId: {[Op.in]: requestedIds}});
    }
  } else if (availableIds) {
    Object.assign(whereClause, {
      courseId: {[Op.in]: Array.from(availableIds)},
    });
  }

  const allGrades = await FinalGrade.findAll({
    include: [
      {
        model: Course,
        attributes: ['id', 'courseCode', 'maxCredits'],
      },
    ],
    where: whereClause,
  });

  // Track global statistics
  let totalGradeSum = 0;
  let gradeCount = 0;
  const uniqueStudents = new Set<number>();
  const allGradesForMedian: number[] = [];

  const yearlyStatsMap = new Map<string | number, YearlyStatsData>();

  // Map<CourseId, Map<Year, Stats>>
  const courseStatsMap = new Map<number, CourseStatsData>();

  for (const gradeEntry of allGrades) {
    const gradeValue = gradeEntry.grade;
    const userId = gradeEntry.userId;
    const course = gradeEntry.Course;

    if (!course) continue; // Skip entries without associated course

    // Track for global statistics
    uniqueStudents.add(userId);
    if (gradeValue >= 0) {
      allGradesForMedian.push(gradeValue);
      if (gradeValue > 0) {
        totalGradeSum += gradeValue;
        gradeCount++;
      }
    }

    const date = new Date(gradeEntry.date);
    if (Number.isNaN(date.getTime())) continue;

    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    let timeKey: string | number = year;

    if (grouping === 'ACADEMIC' || grouping === 'COURSE') {
      // Academic year starts Aug 1 (Month 7)
      if (month < 7) {
        // Jan-Jul -> Part of previous academic year (e.g., Jan 2025 -> 2024-2025)
        timeKey = `${year - 1}-${year}`;
      } else {
        // Aug-Dec -> Part of current academic year (e.g., Aug 2024 -> 2024-2025)
        timeKey = `${year}-${year + 1}`;
      }
    }

    // Initialize yearly stats if needed
    if (!yearlyStatsMap.has(timeKey)) {
      yearlyStatsMap.set(timeKey, {
        totalStudents: new Set(),
        totalEnrolled: new Set(),
        gradeSum: 0,
        gradeCount: 0,
        gradeDistribution: {},
        grades: [],
      });
    }

    const yearStat = yearlyStatsMap.get(timeKey)!;
    yearStat.totalStudents.add(userId);

    if (gradeValue >= 0) {
      yearStat.grades.push(gradeValue);
      const gradeKey = String(gradeValue);
      yearStat.gradeDistribution[gradeKey] =
        (yearStat.gradeDistribution[gradeKey] || 0) + 1;

      if (gradeValue > 0) {
        yearStat.gradeSum += gradeValue;
        yearStat.gradeCount++;
      }
    }

    // Update per-course statistics
    if (!courseStatsMap.has(course.id)) {
      courseStatsMap.set(course.id, {
        courseCode: course.courseCode,
        name: {fi: '', en: '', sv: ''}, // Will be populated later
        yearlyStats: new Map(),
      });
    }
    const cStats = courseStatsMap.get(course.id)!;

    if (!cStats.yearlyStats.has(timeKey)) {
      cStats.yearlyStats.set(timeKey, {
        totalStudents: new Set(),
        totalEnrolled: new Set(),
        gradeSum: 0,
        gradeCount: 0,
        gradeDistribution: {},
        grades: [],
      });
    }
    const cYearStat = cStats.yearlyStats.get(timeKey)!;
    cYearStat.totalStudents.add(userId);

    if (gradeValue >= 0) {
      cYearStat.grades.push(gradeValue);
      const courseGradeKey = String(gradeValue);
      cYearStat.gradeDistribution[courseGradeKey] =
        (cYearStat.gradeDistribution[courseGradeKey] || 0) + 1;

      if (gradeValue > 0) {
        cYearStat.gradeSum += gradeValue;
        cYearStat.gradeCount++;
      }
    }
  }

  // Enrollment Statistics Logic
  const roleWhereClause: WhereOptions = {
    role: CourseRoleType.Student,
  };

  if (startDate || endDate) {
    const createdAtFilter: Record<symbol, Date> = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        createdAtFilter[Op.gte] = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        createdAtFilter[Op.lte] = end;
      }
    }
    Object.assign(roleWhereClause, {createdAt: createdAtFilter});
  }

  // Reuse courseId filter from grades whereClause
  const gradesCourseFilter = (whereClause as Record<string, unknown>).courseId;
  if (gradesCourseFilter) {
    Object.assign(roleWhereClause, {courseId: gradesCourseFilter});
  }

  const allRoles = await CourseRole.findAll({
    where: roleWhereClause,
  });

  // Get all unique course IDs from roles
  const roleCourseIds = new Set(allRoles.map(r => r.courseId));
  const roleCourses = await Course.findAll({
    where: {id: {[Op.in]: Array.from(roleCourseIds)}},
    attributes: ['id', 'courseCode'],
  });
  const courseMap = new Map(roleCourses.map(c => [c.id, c]));

  const uniqueEnrolledStudents = new Set<number>();

  for (const role of allRoles) {
    const course = courseMap.get(role.courseId);
    if (!course) continue;

    // Access role data directly
    const roleData = {
      userId: role.userId,
      courseId: role.courseId,
      Course: course,
      createdAt: role.createdAt,
    };

    if (!roleData.courseId) continue;

    const userId = roleData.userId;
    uniqueEnrolledStudents.add(userId);

    const date = new Date(roleData.createdAt);
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    let timeKey: string | number = year;

    if (grouping === 'ACADEMIC' || grouping === 'COURSE') {
      // Academic year starts Aug 1 (Month 7)
      if (month < 7) {
        timeKey = `${year - 1}-${year}`;
      } else {
        timeKey = `${year}-${year + 1}`;
      }
    }

    // Update Global/Yearly Stats Map
    if (!yearlyStatsMap.has(timeKey)) {
      yearlyStatsMap.set(timeKey, {
        totalStudents: new Set(),
        totalEnrolled: new Set(),
        gradeSum: 0,
        gradeCount: 0,
        gradeDistribution: {},
        grades: [],
      });
    }
    const yearStat = yearlyStatsMap.get(timeKey)!;
    yearStat.totalEnrolled.add(userId);

    // Update Course Stats Map
    if (!courseStatsMap.has(course.id)) {
      courseStatsMap.set(course.id, {
        courseCode: course.courseCode,
        name: {fi: '', en: '', sv: ''},
        yearlyStats: new Map(),
      });
    }
    const cStats = courseStatsMap.get(course.id)!;

    if (!cStats.yearlyStats.has(timeKey)) {
      cStats.yearlyStats.set(timeKey, {
        totalStudents: new Set(),
        totalEnrolled: new Set(),
        gradeSum: 0,
        gradeCount: 0,
        gradeDistribution: {},
        grades: [],
      });
    }
    cStats.yearlyStats.get(timeKey)!.totalEnrolled.add(userId);
  }

  // Populate course names
  const uniqueCourseIds = Array.from(courseStatsMap.keys());
  if (uniqueCourseIds.length > 0) {
    const translations = await CourseTranslation.findAll({
      where: {
        courseId: {
          [Op.in]: uniqueCourseIds,
        },
      },
    });

    for (const t of translations) {
      const cStat = courseStatsMap.get(t.courseId);
      if (cStat) {
        if (t.language === 'FI') cStat.name.fi = t.courseName;
        else if (t.language === 'EN') cStat.name.en = t.courseName;
        else cStat.name.sv = t.courseName;
      }
    }
  }

  // Build yearly statistics with new metrics
  const yearlyStatistics = Array.from(yearlyStatsMap.entries())
    .map(([year, stat]) => {
      const totalStudents = stat.totalStudents.size;
      const totalEnrolled = stat.totalEnrolled.size;
      const {passingCount, failingCount} = getPassFailCounts(
        stat.gradeDistribution,
      );
      const averageGrade = stat.gradeCount ? stat.gradeSum / stat.gradeCount : 0;
      const medianGrade = calculateMedian(stat.grades);
      const passRate = calculatePercentage(passingCount, totalStudents);
      const completionRate = calculatePercentage(totalStudents, totalEnrolled);

      return {
        year,
        totalStudents,
        totalEnrolled,
        averageGrade,
        medianGrade,
        gradeDistribution: stat.gradeDistribution,
        passingCount,
        failingCount,
        passRate,
        completionRate,
      };
    })
    .sort((a, b) => (String(b.year) > String(a.year) ? 1 : -1));

  // Build per-course statistics with new metrics
  const courseStatistics = Array.from(courseStatsMap.entries()).map(
    ([courseId, data]) => {
      const yearlyStats = Array.from(data.yearlyStats.entries())
        .map(([year, stat]) => {
          const totalStudents = stat.totalStudents.size;
          const totalEnrolled = stat.totalEnrolled.size;
          const {passingCount, failingCount} = getPassFailCounts(
            stat.gradeDistribution,
          );
          const averageGrade = stat.gradeCount
            ? stat.gradeSum / stat.gradeCount
            : 0;
          const medianGrade = calculateMedian(stat.grades);
          const passRate = calculatePercentage(passingCount, totalStudents);
          const completionRate = calculatePercentage(totalStudents, totalEnrolled);

          return {
            year,
            totalStudents,
            totalEnrolled,
            averageGrade,
            medianGrade,
            gradeDistribution: stat.gradeDistribution,
            passingCount,
            failingCount,
            passRate,
            completionRate,
          };
        })
        .sort((a, b) => (String(b.year) > String(a.year) ? 1 : -1));

      return {
        courseId,
        courseCode: data.courseCode,
        courseName: data.name,
        yearlyStatistics: yearlyStats,
      };
    },
  );

  // Calculate global statistics with new metrics
  const totalStudents = uniqueStudents.size;
  const totalEnrolled = uniqueEnrolledStudents.size;
  const {passingCount, failingCount} = getPassFailCounts(
    yearlyStatistics.reduce(
      (acc, ys) => {
        Object.entries(ys.gradeDistribution).forEach(([grade, count]) => {
          acc[grade] = (acc[grade] || 0) + count;
        });
        return acc;
      },
      {} as Record<string, number>,
    ),
  );
  const averageGrade = gradeCount ? totalGradeSum / gradeCount : 0;
  const medianGrade = calculateMedian(allGradesForMedian);
  const passRate = calculatePercentage(passingCount, totalStudents);
  const completionRate = calculatePercentage(totalStudents, totalEnrolled);
  const totalActiveCourses = courseStatsMap.size;

  const stats: GlobalStatistics = {
    totalStudents,
    totalEnrolled,
    averageGrade,
    medianGrade,
    passingCount,
    failingCount,
    passRate,
    completionRate,
    totalActiveCourses,
    yearlyStatistics,
    courseStatistics,
  };

  res.status(HttpCode.Ok).json(stats);
};

export const getCourseStatistics: Endpoint<
  {courseId: string},
  CourseStatistics
> = async (req, res) => {
  const {startDate, endDate, gradingModelId, coursePartId, courseTaskId} = req.query as {
    startDate?: string;
    endDate?: string;
    gradingModelId?: string;
    coursePartId?: string;
    courseTaskId?: string;
  };

  let courseId: number;
  const param = req.params.courseId;
  const numericId = Number(param);

  if (Number.isNaN(numericId)) {
    // Try to find by course code
    const course = await Course.findOne({
      where: {courseCode: param},
      attributes: ['id'],
    });

    if (!course) {
      throw new ApiError(
        `Course with code ${param} not found`,
        HttpCode.NotFound,
      );
    }
    courseId = course.id;
  } else {
    courseId = await validateCourseId(param);
  }

  const now = new Date();

  // Run queries in parallel
  const [
    parts,
    tasks,
    finalGrades,
    gradingModels,
    totalEnrolledStudents,
    totalTeachers,
    totalAssistants,
    courseDetails,
  ] = await Promise.all([
    CoursePart.findAll({
      where: {
        courseId,
        ...(coursePartId ? {id: Number(coursePartId)} : {}),
      },
    }),
    CourseTask.findAll({
      where: courseTaskId ? {id: Number(courseTaskId)} : {},
      include: [
        {
          model: CoursePart,
          where: {
            courseId,
            ...(coursePartId ? {id: Number(coursePartId)} : {}),
          },
          required: true,
          attributes: [],
        },
      ],
      attributes: ['id', 'name'],
    }),
    FinalGrade.findAll({where: {courseId}}),
    GradingModel.findAll({where: {courseId}}),
    CourseRole.count({
      where: {
        courseId,
        role: CourseRoleType.Student,
      },
    }),
    CourseRole.count({
      where: {
        courseId,
        role: CourseRoleType.Teacher,
      },
    }),
    CourseRole.count({
      where: {
        courseId,
        role: CourseRoleType.Assistant,
      },
    }),
    Course.findByPk(courseId, {attributes: ['maxCredits']}),
  ]);

  const totalCourseParts = parts.length;
  const expiredCourseParts = parts.filter(
    p => p.expiryDate && new Date(p.expiryDate) < now,
  ).length;

  const taskIds = tasks.map(t => t.id);

  const [totalTaskGrades, expiredTaskGrades, activeUsers, taskGradeStats] =
    await Promise.all([
      TaskGrade.count({
        where: {courseTaskId: {[Op.in]: taskIds}},
      }),
      TaskGrade.count({
        where: {
          courseTaskId: {[Op.in]: taskIds},
          expiryDate: {[Op.lt]: now},
        },
      }),
      TaskGrade.findAll({
        attributes: ['userId'],
        where: {courseTaskId: {[Op.in]: taskIds}},
        group: ['userId'],
      }),
      TaskGrade.findAll({
        attributes: [
          'courseTaskId',
          [fn('COUNT', col('id')), 'submissionCount'],
          [fn('AVG', col('grade')), 'averageGrade'],
        ],
        where: {courseTaskId: {[Op.in]: taskIds}},
        group: ['courseTaskId'],
        raw: true,
      }),
    ]);

  const activeStudentIds = new Set(activeUsers.map(u => u.userId));
  const activeStudents = activeStudentIds.size;

  const taskStatistics = tasks.map((t) => {
    const stats = taskGradeStats.find(s => s.courseTaskId === t.id) as
      | TaskGradeAggregation
      | undefined;

    return {
      id: t.id,
      name: t.name,
      submissionCount: stats ? Number(stats.submissionCount) : 0,
      averageGrade: stats ? Number(stats.averageGrade) : 0,
    };
  });

  // Deduplicate final grades: keep only the latest grade for each student
  const latestFinalGradesMap = new Map<number, FinalGrade>();
  for (const grade of finalGrades) {
    const existing = latestFinalGradesMap.get(grade.userId);
    if (existing) {
      const currentDate = new Date(grade.date);
      const existingDate = new Date(existing.date);
      if (
        currentDate > existingDate
        || (currentDate.getTime() === existingDate.getTime()
          && grade.grade > existing.grade)
      ) {
        latestFinalGradesMap.set(grade.userId, grade);
      }
    } else {
      latestFinalGradesMap.set(grade.userId, grade);
    }
  }
  const uniqueFinalGrades = Array.from(latestFinalGradesMap.values());

  // Filter final grades based on parameters
  const filteredGrades = uniqueFinalGrades.filter((fg) => {
    let matches = true;
    if (gradingModelId && fg.gradingModelId !== Number(gradingModelId)) {
      matches = false;
    }
    const gradeDate = new Date(fg.date);
    if (startDate && gradeDate < new Date(startDate)) {
      matches = false;
    }
    if (endDate && gradeDate > new Date(endDate)) {
      matches = false;
    }
    return matches;
  });

  const totalFinalGrades = filteredGrades.length;
  let exportedToSisu = 0;
  let notExportedToSisu = 0;
  let gradeSum = 0;
  let gradeCount = 0;
  const gradeDistribution: Record<string, number> = {};
  const uniqueStudents = new Set<number>();

  const gradesOverTimeMap = new Map<string, {sum: number; count: number}>();

  for (const fg of filteredGrades) {
    if (fg.sisuExportDate) exportedToSisu++;
    else notExportedToSisu++;

    uniqueStudents.add(fg.userId);

    // Calculate distributions
    if (fg.grade >= 0) {
      const gKey = String(fg.grade);
      gradeDistribution[gKey] = (gradeDistribution[gKey] || 0) + 1;
    }

    if (fg.grade > 0) {
      gradeSum += fg.grade;
      gradeCount++;
    }

    // Process timeline data
    if (fg.grade >= 0) {
      const dateKey = new Date(fg.date).toISOString().split('T')[0]; // YYYY-MM-DD
      const entry = gradesOverTimeMap.get(dateKey) || {sum: 0, count: 0};
      if (fg.grade > 0) {
        entry.sum += fg.grade;
      }
      entry.count += 1;
      gradesOverTimeMap.set(dateKey, entry);
    }
  }

  const gradesOverTime = Array.from(gradesOverTimeMap.entries())
    .map(([date, {sum, count}]) => ({
      date,
      averageGrade: count > 0 ? sum / count : 0,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate median (all grades including 0)
  const allGradesValues = filteredGrades
    .filter(g => activeStudentIds.has(g.userId) && g.grade >= 0)
    .map(g => g.grade);
  const medianGrade = calculateMedian(allGradesValues);

  // Calculate median for passing students only (grade > 0)
  const passingGradesValues = filteredGrades
    .filter(g => activeStudentIds.has(g.userId) && g.grade > 0)
    .map(g => g.grade);
  const passingMedianGrade = calculateMedian(passingGradesValues);

  const failingCount = gradeDistribution['0'] || 0;
  const passingCount = totalFinalGrades - failingCount;

  // Calculate stats per grading model
  const gradingModelStats = gradingModels.map((gm) => {
    const modelGrades = uniqueFinalGrades.filter(
      fg => fg.gradingModelId === gm.id && fg.grade >= 0,
    );

    const modelDistribution: Record<string, number> = {};
    let modelSum = 0;
    let modelCount = 0;
    for (const g of modelGrades) {
      const gKey = String(g.grade);
      modelDistribution[gKey] = (modelDistribution[gKey] || 0) + 1;

      if (g.grade > 0) {
        modelSum += g.grade;
        modelCount++;
      }
    }

    return {
      id: gm.id,
      name: gm.name,
      count: modelGrades.length,
      averageGrade: modelCount ? modelSum / modelCount : 0,
      gradeDistribution: modelDistribution,
    };
  });

  const averageGrade = gradeCount ? gradeSum / gradeCount : 0;
  const passingAverageGrade = averageGrade; // Average is already calculated for passing students only

  const maxCredits = courseDetails?.maxCredits || 0;

  res.json({
    averageGrade,
    passingAverageGrade,
    gradeDistribution,
    totalStudents: uniqueStudents.size,
    totalEnrolledStudents,
    activeStudents,
    totalTeachers,
    totalAssistants,
    maxCredits,
    totalCourseParts,
    expiredCourseParts,
    totalTaskGrades,
    expiredTaskGrades,
    totalFinalGrades,
    exportedToSisu,
    notExportedToSisu,
    gradingModels: gradingModelStats,
    gradesOverTime,
    taskStatistics,
    passingCount,
    failingCount,
    medianGrade,
    passingMedianGrade,
  });
};
