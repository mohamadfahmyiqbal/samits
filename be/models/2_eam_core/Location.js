// models/2_eam_core/Location.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Location = sequelize.define('Location', {
        location_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        location_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    }, {
        tableName: 'locations',
        timestamps: false,
    });

    return Location;
};
