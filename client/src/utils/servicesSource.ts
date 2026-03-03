// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export const setServiceToken = (serviceId: string, token: string): void =>
  localStorage.setItem(serviceId, token);

export const resetServiceToken = (serviceId: string): void => localStorage.removeItem(serviceId);

export const resetAllServiceToken = (): void => {
  SERVICE_SOURCE_OPTIONS.forEach(service => resetServiceToken(service.id));
};

export const getServiceToken = (serviceId: string): string | null => localStorage.getItem(serviceId);

export type ServiceSourceOption = {
  id: string;
  label: string;
  tokenLink: string;
};
export const SERVICE_SOURCE_OPTIONS: ServiceSourceOption[] = [
  {id: 'mycourses', label: 'MyCourses', tokenLink: 'https://mycourses.aalto.fi/'},
  {id: 'aplus', label: 'A+', tokenLink: 'https://plus.cs.aalto.fi/accounts/accounts/'},
];

// export const getLatestAplusModuleDate = (
//   aplusExerciseData: AplusExerciseData
// ): Date =>
//   aplusExerciseData.modules.sort(
//     (a, b) => b.closingDate.getTime() - a.closingDate.getTime()
//   )[0].closingDate;

// export const newAplusGradeSource = (
//   aplusCourse: AplusCourseData,
//   date: Date,
//   {
//     module,
//     exercise,
//     difficulty,
//   }: {
//     module?: {id: number; name: string};
//     exercise?: {id: number; name: string};
//     difficulty?: {difficulty: string};
//   }
// ): NewAplusGradeSourceData => {
//   const base = {courseTaskId: -1, aplusCourse: aplusCourse, date: date};

//   if (module !== undefined) {
//     return {
//       ...base,
//       sourceType: AplusGradeSourceType.Module,
//       moduleId: module.id,
//       moduleName: module.name,
//     };
//   }

//   if (exercise !== undefined) {
//     return {
//       ...base,
//       sourceType: AplusGradeSourceType.Exercise,
//       exerciseId: exercise.id,
//       exerciseName: exercise.name,
//     };
//   }

//   if (difficulty !== undefined) {
//     return {
//       ...base,
//       sourceType: AplusGradeSourceType.Difficulty,
//       difficulty: difficulty.difficulty,
//     };
//   }

//   return {
//     ...base,
//     sourceType: AplusGradeSourceType.FullPoints,
//   };
// };
