// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DataTypes, type QueryInterface, QueryTypes} from 'sequelize';

import {SystemRole} from '@/common/types';
import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add idpUser and admin columns
      await queryInterface.addColumn(
        'user',
        'idp_user',
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        {transaction}
      );
      await queryInterface.addColumn(
        'user',
        'admin',
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        {transaction}
      );

      // Fetch user data and update new columns
      const users: {
        id: number;
        role: SystemRole;
        email: string | null;
      }[] = await queryInterface.sequelize.query(
        'SELECT id, role, email FROM public.user',
        {type: QueryTypes.SELECT, transaction}
      );

      for (const user of users) {
        if (user.role === SystemRole.User && user.email) {
          await queryInterface.sequelize.query(
            `UPDATE public.user SET idp_user = true WHERE id = ${user.id}`,
            {transaction}
          );
        }
        if (user.role === SystemRole.Admin) {
          await queryInterface.sequelize.query(
            `UPDATE public.user SET admin = true WHERE id = ${user.id}`,
            {transaction}
          );
        }
      }

      await queryInterface.removeColumn('user', 'role', {transaction});
      await queryInterface.sequelize.query('DROP TYPE enum_user_role;', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add role column
      await queryInterface.addColumn(
        'user',
        'role',
        {
          type: DataTypes.ENUM('USER', 'ADMIN'),
          allowNull: false,
          defaultValue: 'USER',
        },
        {transaction}
      );

      // Fetch user data and update restored column
      const users: {id: number; idp_user: boolean; admin: boolean}[] =
        await queryInterface.sequelize.query(
          'SELECT id, idp_user, admin FROM public.user',
          {type: QueryTypes.SELECT, transaction}
        );

      for (const user of users) {
        if (user.idp_user) {
          await queryInterface.sequelize.query(
            `UPDATE public.user SET role = 'USER' WHERE id = ${user.id}`,
            {transaction}
          );
        } else {
          await queryInterface.sequelize.query(
            `UPDATE public.user SET role = 'ADMIN' WHERE id = ${user.id}`,
            {transaction}
          );
        }
      }

      await queryInterface.removeColumn('user', 'idp_user', {transaction});
      await queryInterface.removeColumn('user', 'admin', {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
