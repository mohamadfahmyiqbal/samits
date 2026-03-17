// models/2_eam_core/Vendor.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Vendor = sequelize.define('Vendor', {
        vendor_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        vendor_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        contact: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    }, {
        tableName: 'vendors',
        timestamps: false,
    });

    return Vendor;
};
