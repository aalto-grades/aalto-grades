// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockSuggestedAssignments = [
  { category: 'Exercises',
    totalPoints: 40,
    assignments: [ 
      { type: 'Exercises', id: 1, description: '4 mandatory exercises', points: 20, weight: 0.2, expiryDate: new Date(2024, 8, 14), 
        subAttainments: [
          { type: 'Exercises', id: 11, description: 'Exercise 1', points: 5, weight: 0.2 }, 
          { type: 'Exercises', id: 12, description: 'Exercise 2', points: 5, weight: 0.2 }, 
          { type: 'Exercises', id: 13, description: 'Exercise 3', points: 5, weight: 0.2, 
            subAttainments: [
              { type: 'Exercises', id: 111, description: 'Exercise 3.1', points: 5, weight: 0.2 }, 
              { type: 'Exercises', id: 112, description: 'Exercise 3.2', points: 5, weight: 0.2 }
            ] 
          }, 
          { type: 'Exercises', id: 14, description: 'Exercise 4', points: 5, weight: 0.2 }
        ] 
      },
      { type: 'Exercises', id: 4, description: '3 optional exercises', points: 20, weight: 0.2, expiryDate: new Date(2024, 8, 14), 
        subAttainments: [
          { type: 'Exercises', id: 15, description: 'Exercise 5', points: 5, weight: 0.2 }, 
          { type: 'Exercises', id: 16, description: 'Exercise 6', points: 5, weight: 0.2 }, 
          { type: 'Exercises', id: 17, description: 'Exercise 7', points: 5, weight: 0.2 },
        ] 
      }
    ]
  },
  { category: 'Projects',
    totalPoints: 30,
    assignments: [
      { type: 'Projects', id: 2, description: '1 mandatory project', points: 30, weight: 0.20, expiryDate: new Date(2024, 8, 14) }
    ]
  },
  { category: 'Exams',
    totalPoints: 40,
    assignments: [
      { type: 'Exams', id: 3, description: '1 mandatory exam', points: 40, weight: 0.55, expiryDate: new Date(2024, 8, 14) }
    ]
  }
];

export default mockSuggestedAssignments;