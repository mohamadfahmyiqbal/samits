// models/5_itam_management/ITItemAttribute.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItemAttribute = sequelize.define('ITItemAttribute', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        it_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        attr_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        attr_value: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'it_item_attributes',
        timestamps: false,
    });

    return ITItemAttribute;
};
