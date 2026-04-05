import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MaintenanceChecklistTemplate = sequelize.define(
    'MaintenanceChecklistTemplate',
    {
      template_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      sub_category: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      template_label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
    },
    {
      tableName: 'maintenance_checklist_templates',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return MaintenanceChecklistTemplate;
};
