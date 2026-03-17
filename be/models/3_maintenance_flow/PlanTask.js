// models/3_maintenance_flow/PlanTask.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PlanTask = sequelize.define('PlanTask', {
        task_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        task_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'plan_tasks',
        timestamps: false,
    });

    return PlanTask;
};
