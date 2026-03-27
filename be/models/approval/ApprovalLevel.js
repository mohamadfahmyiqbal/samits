import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ApprovalLevel = sequelize.define('ApprovalLevel', {
    level_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    level_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'approval_levels',
    timestamps: false
  });

  ApprovalLevel.associate = (models) => {
    if (models.ApprovalHistory) {
      ApprovalLevel.hasMany(models.ApprovalHistory, {
        foreignKey: 'level_id',
        as: 'histories'
      });
    }
  };

  return ApprovalLevel;
};

