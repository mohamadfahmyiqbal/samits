// models/3_maintenance_flow/WorkOrder.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
 const WorkOrder = sequelize.define('WorkOrder', {
  wo_id: {
   type: DataTypes.INTEGER,
   primaryKey: true,
   autoIncrement: true,
   field: 'wo_id'
  },
  title: {
   type: DataTypes.STRING(255),
   allowNull: false
  },
  plan_id: {
   type: DataTypes.INTEGER,
   allowNull: false
  },
  description: DataTypes.TEXT,
  asset_id: {
   type: DataTypes.BIGINT,
   allowNull: true
  },
  it_item_id: {
   type: DataTypes.UUID,
   allowNull: true,
   field: 'it_item_id'
  },
  status: {
   type: DataTypes.STRING(50),
   defaultValue: 'open'
  },
  priority: {
   type: DataTypes.STRING(20),
   defaultValue: 'medium'
  },
  assigned_to_nik: DataTypes.STRING(20),
  category: DataTypes.STRING(50),
  scheduled_date: DataTypes.DATE,
  completed_at: DataTypes.DATE,
 }, {
  tableName: 'work_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
 });

  WorkOrder.associate = (models) => {
   WorkOrder.hasMany(models.WOAssignment, {
    foreignKey: 'wo_id',
    as: 'assignments'
   });
   
   WorkOrder.belongsTo(models.MaintenancePlan, {
    foreignKey: 'plan_id',
    as: 'plan'
   });

   if (models.ITItem) {
    WorkOrder.belongsTo(models.ITItem, {
     foreignKey: 'it_item_id',
     as: 'itItem'
    });
   }
 };


 return WorkOrder;
};
