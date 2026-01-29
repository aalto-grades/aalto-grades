// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import { Divider, Stack } from "@mui/material";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import type { CoursePartData, CourseTaskData } from "@/common/types";
import DashboardCard from "@/components/course/overview/DashboardCard";
import DetailItem from "@/components/course/overview/DetailItem";

interface CourseStructureCardProps {
  courseParts: CoursePartData[] | undefined;
  courseTasks: CourseTaskData[] | undefined;
  totalTaskGrades: number;
  expiredTaskGrades: number;
  expiredCourseParts: number;
  totalEnrolledStudents: number;
  activeStudents: number;
}

const CourseStructureCard = ({
  courseParts,
  courseTasks,
  totalTaskGrades,
  expiredTaskGrades,
  expiredCourseParts,
  totalEnrolledStudents,
  activeStudents,
}: CourseStructureCardProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <DashboardCard title={t("course.dashboard.structure")}>
      <Stack spacing={1.5}>
        <DetailItem
          label={t("course.dashboard.parts")}
          value={courseParts?.length || 0}
          subValue={
            expiredCourseParts
              ? `${expiredCourseParts} ${t("course.statistics.expired")}`
              : undefined
          }
          warning={!!expiredCourseParts}
        />
        <DetailItem
          label={t("course.dashboard.tasks")}
          value={courseTasks?.length || 0}
        />
        <DetailItem
          label={t("course.statistics.task-grades")}
          value={totalTaskGrades || 0}
          subValue={
            expiredTaskGrades
              ? `${expiredTaskGrades} ${t("course.statistics.expired")}`
              : undefined
          }
          warning={!!expiredTaskGrades}
        />
        <Divider />
        <DetailItem
          label={t("course.statistics.total-enrolled")}
          value={totalEnrolledStudents || 0}
        />
        <DetailItem
          label={t("course.statistics.active-students")}
          value={activeStudents || 0}
          subValue={
            totalEnrolledStudents
              ? `${((activeStudents / totalEnrolledStudents) * 100).toFixed(0)}%`
              : undefined
          }
        />
      </Stack>
    </DashboardCard>
  );
};

export default CourseStructureCard;
