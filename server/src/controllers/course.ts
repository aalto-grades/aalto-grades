// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface Course {
  id: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface CourseInstances {
  courseInstances: Array<Course>
}