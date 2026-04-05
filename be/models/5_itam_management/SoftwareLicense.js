// models/5_itam_management/SoftwareLicense.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const SoftwareLicense = sequelize.define('SoftwareLicense', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'software_licenses',
        timestamps: true,
    });

    return SoftwareLicense;
};
