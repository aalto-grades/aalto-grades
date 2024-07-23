// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export type AplusCoursesRes = {
  staff_courses: {
    id: number;
    code: string;
    name: string;
    instance_name: string;
    html_url: string;
  }[];
};

export type AplusExercisesRes = {
  results: {
    id: number;
    display_name: string;
    closing_time: Date;
    exercises: {
      id: number;
      display_name: string;
      difficulty: string;
    }[];
  }[];
};

export type AplusStudentPoints = {
  student_id: string | null;
  points: number;
  points_by_difficulty: {
    [key: string]: number;
  };
  modules: {
    id: number;
    points: number;
    exercises: {
      id: number;
      points: number;
    }[];
  }[];
};

export type AplusPointsRes = {
  results: AplusStudentPoints[];
};
