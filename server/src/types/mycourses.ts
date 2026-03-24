// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

const MoodleFunctionSchema = z.object({
  name: z.string(),
  version: z.string(),
});

const AdvancedFeatureSchema = z.object({
  name: z.string(),
  value: z.number(), // 0 or 1 usually
});

export const MoodleSiteInfoSchema = z.looseObject({
  sitename: z.string(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  fullname: z.string(),
  lang: z.string(),
  userid: z.number(),
  siteurl: z.url(),
  userpictureurl: z.url(),
  functions: z.array(MoodleFunctionSchema),
  downloadfiles: z.number(), // 1 or 0
  uploadfiles: z.number(), // 1 or 0
  release: z.string(),
  version: z.string(),
  mobilecssurl: z.string(), // Can be empty string
  advancedfeatures: z.array(AdvancedFeatureSchema),
  usercanmanageownfiles: z.boolean(),
  userquota: z.number(),
  usermaxuploadfilesize: z.number(),
  userhomepage: z.number(),
  userprivateaccesskey: z.string().optional(), // Sometimes optional depending on site config
  siteid: z.number(),
  sitecalendartype: z.string(),
  usercalendartype: z.string(),
  userissiteadmin: z.boolean(),
  theme: z.string(),
  limitconcurrentlogins: z.number(),
  policyagreed: z.number(),
});

export const MoodleCourseSchema = z.object({
  id: z.number(),
  shortname: z.string(),
  fullname: z.string(),
  displayname: z.string(),
  enrolledusercount: z.number(),
  idnumber: z.string(),
  visible: z.number(),
  summary: z.string(),
  summaryformat: z.number(),
  format: z.string(),
  courseimage: z.string(),
  showgrades: z.boolean(),
  lang: z.string(),
  enablecompletion: z.boolean(),
  completionhascriteria: z.boolean(),
  completionusertracked: z.boolean(),
  category: z.number(),
  progress: z.number().nullable(),
  completed: z.boolean(),
  startdate: z.number(),
  enddate: z.number(),
  marker: z.number(),
  lastaccess: z.number(),
  isfavourite: z.boolean(),
  hidden: z.boolean(),
  overviewfiles: z.array(z.unknown()),
  showactivitydates: z.boolean(),
  showcompletionconditions: z.boolean(),
  timemodified: z.number()
});

export const GradeItemSchema = z.object({
  id: z.number(),
  itemname: z.string().nullable(),
  itemtype: z.string(),
  itemmodule: z.string().nullable(),
  iteminstance: z.number(),
  itemnumber: z.number().nullable(),
  idnumber: z.string().nullable(),
  categoryid: z.number().nullable(),
  outcomeid: z.number().nullable(),
  scaleid: z.number().nullable(),
  locked: z.boolean(),
  graderaw: z.number().nullable(),
  gradedatesubmitted: z.number().nullable(),
  gradedategraded: z.number().nullable(),
  gradehiddenbydate: z.boolean(),
  gradeneedsupdate: z.boolean(),
  gradeishidden: z.boolean(),
  gradeislocked: z.boolean(),
  gradeisoverridden: z.boolean(),
  gradeformatted: z.string(),
  feedback: z.string(),
  feedbackformat: z.number(),
  cmid: z.number().optional(),
});

export const UserGradeSchema = z.object({
  courseid: z.number(),
  courseidnumber: z.string(),
  userid: z.number(),
  userfullname: z.string(),
  useridnumber: z.string(),
  maxdepth: z.number(),
  gradeitems: z.array(GradeItemSchema),
});

export const MoodleUserGradesResponseSchema = z.object({
  usergrades: z.array(UserGradeSchema),
  warnings: z.array(z.unknown()),
});

export const GradeItemSimpleSchema = z.object({
  id: z.string(),
  itemname: z.string(),
  category: z.string(),
});

export const MoodleGradeItemsResponseSchema = z.object({
  gradeItems: z.array(GradeItemSimpleSchema),
  warnings: z.array(z.unknown()),
});
