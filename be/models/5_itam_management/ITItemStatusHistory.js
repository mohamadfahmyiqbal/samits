// models/5_itam_management/ITItemStatusHistory.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItemStatusHistory = sequelize.define('ITItemStatusHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        it_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        changed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'it_item_status_history',
        timestamps: false,
    });

    return ITItemStatusHistory;
};
