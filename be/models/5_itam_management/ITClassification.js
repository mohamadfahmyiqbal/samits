// models/5_itam_management/ITClassification.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITClassification = sequelize.define('ITClassification', {
        classification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        classification_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        tableName: 'it_classifications',
        timestamps: false,
    });

    ITClassification.associate = (models) => {
        if (models.ITItem) {
            ITClassification.hasMany(models.ITItem, {
                foreignKey: 'classification_id',
                sourceKey: 'classification_id',
                as: 'items',
            });
        }
    };

    return ITClassification;
};

