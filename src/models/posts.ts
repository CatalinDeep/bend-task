import { Sequelize, DataTypes } from 'sequelize';

import { Post } from '../repositories/posts';

export function setupPostsModel(modelName: string, sequelize: Sequelize): void {
  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isHidden: {
        type: DataTypes.BOOLEAN,
        field: 'is_hidden',
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      authorId: {
        type: DataTypes.INTEGER,
        field: 'authorId',
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'posts',
      modelName,
      name: {
        singular: 'post',
        plural: 'posts',
      },
      timestamps: true,
    }
  );
}
