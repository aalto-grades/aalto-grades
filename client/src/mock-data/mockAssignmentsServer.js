// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockAssignmentsServer = [
  { 
    id: 1,
    parentId: 0,
    name: 'Exercises',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1), 
  },
  { 
    id: 2,
    parentId: 1,
    name: 'Exercise',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1),  
  },
  { 
    id: 3,
    parentId: 1,
    name: 'Exercise',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1), 
  },
  { 
    id: 4,
    parentId: 1,
    name: 'Learning Diaries',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1),
  },
  { 
    id: 5,
    parentId: 4,
    name: 'Learning Diary 1',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1),
  },
  { 
    id: 6,
    parentId: 4,
    name: 'Learning Diary 2',
    date: new Date(2023, 9, 1), 
    expiryDate: new Date(2024, 9, 1),
  }
];
  
export default mockAssignmentsServer;
  