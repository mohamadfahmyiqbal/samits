// models/2_eam_core/AssetLifecycle.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AssetLifecycle = sequelize.define('AssetLifecycle', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        asset_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'asset_lifecycles',
        timestamps: true,
    });

    return AssetLifecycle;
};
