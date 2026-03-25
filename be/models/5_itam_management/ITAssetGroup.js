import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITAssetGroup = sequelize.define('ITAssetGroup', {
        asset_group_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        sub_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        asset_group_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    }, {
        tableName: 'it_asset_groups',
        timestamps: false,
    });

    ITAssetGroup.associate = (models) => {
        if (models.ITSubCategory) {
            ITAssetGroup.belongsTo(models.ITSubCategory, {
                foreignKey: 'sub_category_id',
                targetKey: 'sub_category_id',
                as: 'subCategory',
            });
        }
    };

    return ITAssetGroup;
};

