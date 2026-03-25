// models/5_itam_management/ITItem.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItem = sequelize.define('ITItem', {
        it_item_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        sub_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        request_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        current_status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        asset_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        purchase_price_plan: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        purchase_price_actual: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        po_date_period: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        inspection_date_period: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        no_cip: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        invoice_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        line_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        at_cost_value: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        useful_life_year: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        initial_depreciation: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        accounting_asset_no: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        acquisition_status: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        is_disposed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        disposal_id_ref: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        asset_tag: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        po_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        classification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1, // Default value to avoid NOT NULL constraint issues
        },
        depreciation_end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        disposal_plan_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        extend_warranty_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        asset_group_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'it_asset_groups',
                key: 'asset_group_id',
            },
        },
        asset_main_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'asset_main_types',
                key: 'asset_main_type_id',
            },
        },
    }, {
        tableName: 'it_items',
        timestamps: false,
    });

    ITItem.associate = (models) => {
        if (models.ITSubCategory) {
            ITItem.belongsTo(models.ITSubCategory, {
                foreignKey: 'sub_category_id',
                targetKey: 'sub_category_id',
                as: 'subCategory',
            });
        }
        if (models.ITCategory) {
            ITItem.belongsTo(models.ITCategory, {
                foreignKey: 'category_id',
                targetKey: 'it_category_id',
                as: 'directCategory',
            });
        }
        if (models.ITItemAssignment) {
            ITItem.hasMany(models.ITItemAssignment, {
                foreignKey: 'it_item_id',
                as: 'assignments',
            });
        }
        if (models.ITItemAttribute) {
            ITItem.hasMany(models.ITItemAttribute, {
                foreignKey: 'it_item_id',
                as: 'attributes',
            });
        }
        if (models.ITItemNetwork) {
            ITItem.hasMany(models.ITItemNetwork, {
                foreignKey: 'it_item_id',
                as: 'networks',
            });
        }
        if (models.ITItemStatusHistory) {
            ITItem.hasMany(models.ITItemStatusHistory, {
                foreignKey: 'it_item_id',
                as: 'statusHistory',
            });
        }
        if (models.ITItemSoftware) {
            ITItem.hasMany(models.ITItemSoftware, {
                foreignKey: 'it_item_id',
                as: 'softwares',
            });
        }
        if (models.ITItemSetupChecklist) {
            ITItem.hasMany(models.ITItemSetupChecklist, {
                foreignKey: 'it_item_id',
                as: 'setupChecklists',
            });
        }
        if (models.AssetDocument) {
            ITItem.hasMany(models.AssetDocument, {
                foreignKey: 'it_item_id',
                as: 'documents',
            });
        }
        if (models.ITClassification) {
            ITItem.belongsTo(models.ITClassification, {
                foreignKey: 'classification_id',
                targetKey: 'classification_id',
                as: 'classification',
            });
        }
        if (models.ITAssetGroup) {
            ITItem.belongsTo(models.ITAssetGroup, {
                foreignKey: 'asset_group_id',
                targetKey: 'asset_group_id',
                as: 'assetGroup',
            });
        }
        if (models.AssetMainType) {
            ITItem.belongsTo(models.AssetMainType, {
                foreignKey: 'asset_main_type_id',
                targetKey: 'asset_main_type_id',
                as: 'mainType',
            });
        }
    };

    return ITItem;
};
