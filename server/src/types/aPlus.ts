// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export type APlusCoursesRes = {
  staff_courses: {
    id: number;
    code: string;
    name: string;
    instance_name: string;
    html_url: string;
  }[];
};

export type APlusExercisesRes = {
  results: {
    id: number;
    display_name: string;
    exercises: {difficulty: string}[];
  }[];
};

export type APlusStudentPoints = {
  student_id: string | null;
  points: number;
  points_by_difficulty: {[key: string]: number};
  modules: {id: number; points: number}[];
};

export type APlusPointsRes = {
  results: APlusStudentPoints[];
};
