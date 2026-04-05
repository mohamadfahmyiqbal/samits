// models/5_itam_management/ITCategory.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITCategory = sequelize.define('ITCategory', {
        it_category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        category_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        asset_group: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        asset_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        parent_category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        asset_main_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'it_categories',
        timestamps: false,
    });

    ITCategory.associate = (models) => {
        if (models.ITSubCategory) {
            ITCategory.hasMany(models.ITSubCategory, {
                foreignKey: 'it_category_id',
                sourceKey: 'it_category_id',
                as: 'subCategories',
            });
        }
        if (models.AssetMainType) {
            ITCategory.belongsTo(models.AssetMainType, {
                foreignKey: 'asset_main_type_id',
                targetKey: 'asset_main_type_id',
                as: 'mainType',
            });
        }
    };

    return ITCategory;
};
