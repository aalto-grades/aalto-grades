import CourseInstance from './courseInstance';
import CourseRole from './courseRole';
import Course from './course';
import User from './user';

User.hasMany(CourseRole, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseRole.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

CourseInstance.hasMany(CourseRole, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseRole.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

Course.hasMany(CourseInstance, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseInstance.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

export default {
  CourseInstance,
  CourseRole,
  Course,
  User
};
