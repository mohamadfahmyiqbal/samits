// models/2_eam_core/AssetMainType.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AssetMainType = sequelize.define('AssetMainType', {
        asset_main_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        main_type_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    }, {
        tableName: 'asset_main_types',
        timestamps: false,
        underscored: true,
    });

    return AssetMainType;
};

