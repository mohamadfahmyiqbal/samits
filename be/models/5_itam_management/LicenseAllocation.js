// models/5_itam_management/LicenseAllocation.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const LicenseAllocation = sequelize.define('LicenseAllocation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        license_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'license_allocations',
        timestamps: true,
    });

    return LicenseAllocation;
};
