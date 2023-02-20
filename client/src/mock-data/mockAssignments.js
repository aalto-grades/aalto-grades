// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// These mock assignments are temporary and they will be modified later
// They have been kept in order to not break any tests or content currently in main

const mockAssignments = [
  { 
    id: 1,
    type: 'Exercises',
    name: 'Exercises',
    description: '10 mandatory exercises', 
    points: 30, 
    weight: 0.2, 
    expiryDate: new Date(2024, 8, 14) 
  },
  { 
    id:2,
    type: 'Projects',
    name: 'Projects',
    description: '1 mandatory project', 
    points: 30, 
    weight: 0.20,
    expiryDate: new Date(2024, 8, 14) },
  { 
    id: 3, 
    type: 'Exams',
    name: 'Exams',
    description: '1 mandatory exam', 
    points: 40, 
    weight: 0.55, 
    expiryDate: new Date(2024, 8, 14)
  }
];

export default mockAssignments;
