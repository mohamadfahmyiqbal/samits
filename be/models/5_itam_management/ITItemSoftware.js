// models/5_itam_management/ITItemSoftware.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItemSoftware = sequelize.define('ITItemSoftware', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        it_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        software_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        installed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        version: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        tableName: 'it_item_softwares',
        timestamps: false,
    });

    ITItemSoftware.associate = (models) => {
        if (models.ITItem) {
            ITItemSoftware.belongsTo(models.ITItem, {
                foreignKey: 'it_item_id',
                targetKey: 'it_item_id',
                as: 'item',
            });
        }
    };

    return ITItemSoftware;
};

