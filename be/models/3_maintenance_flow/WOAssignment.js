import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const WOAssignment = sequelize.define('WOAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    wo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'wo_id'
    },
    nik: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'nik'
    },
    assigned_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'assigned_date'
    }
 }, {
    tableName: 'wo_assignments',
    timestamps: false
  });

  WOAssignment.associate = (models) => {
   WOAssignment.belongsTo(models.WorkOrder, {
    foreignKey: 'wo_id',
    as: 'workOrder'
   });
  };

  return WOAssignment;
};

