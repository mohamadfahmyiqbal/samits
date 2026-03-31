import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MaintenanceChecklist = sequelize.define(
    'MaintenanceChecklist',
    {
      checklist_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'checklist_id',
      },
      wo_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      work_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'preventive',
      },
      category: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      sub_category: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      asset_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      template_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      template_label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      item_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_description: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      item_range: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      result: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      notes: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: true,
        defaultValue: 'pending',
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'maintenance_checklists',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  MaintenanceChecklist.associate = (models) => {
    if (models.WorkOrder) {
      MaintenanceChecklist.belongsTo(models.WorkOrder, {
        foreignKey: 'wo_id',
        as: 'workOrder',
      });
    }
  };

  return MaintenanceChecklist;
};
