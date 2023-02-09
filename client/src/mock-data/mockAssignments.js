// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockAssignments = [
  { 
    id: 1,
    type: 'Exercises', 
    description: '10 mandatory exercises', 
    points: 30, 
    weight: 0.2, 
    expiryDate: new Date(2024, 8, 14) 
  },
  { 
    id:2,
    type: 'Projects', 
    description: '1 mandatory project', 
    points: 30, 
    weight: 0.20,
    expiryDate: new Date(2024, 8, 14) },
  { 
    id: 3, 
    type: 'Exams',
    description: '1 mandatory exam', 
    points: 40, 
    weight: 0.55, 
    expiryDate: new Date(2024, 8, 14)
  }
];

export default mockAssignments;
