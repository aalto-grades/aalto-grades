import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert('user', [
      {
        student_id: '123456',
        name: 'test man',
        email: 'man@aalto.fi',
        password: '$2b$10$jIzSAam1Nc9GDm9ltuKHve/TXl9/w4dSTiZeX0sYMyQpPS0GSRRXG',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        student_id: '489432',
        name: 'test girl',
        email: 'girl@aalto.fi',
        password: '$2b$10$jIzSAam1Nc9GDm9ltuKHve/TXl9/w4dSTiZeX0sYMyQpPS0GSRRXG',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        student_id: '934876',
        name: 'jou man',
        email: 'test@aalto.fi',
        password: '$2b$10$jIzSAam1Nc9GDm9ltuKHve/TXl9/w4dSTiZeX0sYMyQpPS0GSRRXG',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('course_role', {}, {});
    await queryInterface.bulkDelete('course_instance', {}, {});
    await queryInterface.bulkDelete('course', {}, {});
    await queryInterface.bulkDelete('user', {}, {});
  },
};
