// models/Comment.js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        comment: "If this is a reply, refers to parent comment ID",
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "comments",
      timestamps: true, 
      indexes: [
        { fields: ["videoId"] },
        { fields: ["parentId"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  Comment.associate = (models) => {
   
    Comment.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Comment;
};