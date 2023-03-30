export interface Grade {
  attainmentId: number,
  points: number
}

export interface Student {
  id?: number,
  studentNumber: string,
  grades: Array<Grade>
}

export interface AttainmentGrade {
  userId: number,
  attainableId: number,
  points: number
}
