// models/5_itam_management/ITItemSetupChecklist.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItemSetupChecklist = sequelize.define('ITItemSetupChecklist', {
        setup_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        it_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        task_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        is_completed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        technician: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        tableName: 'it_item_setup_checklist',
        timestamps: false,
    });

    ITItemSetupChecklist.associate = (models) => {
        if (models.ITItem) {
            ITItemSetupChecklist.belongsTo(models.ITItem, {
                foreignKey: 'it_item_id',
                targetKey: 'it_item_id',
                as: 'item',
            });
        }
    };

    return ITItemSetupChecklist;
};

