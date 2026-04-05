// models/4_inventory_tools/InventoryTransaction.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const InventoryTransaction = sequelize.define('InventoryTransaction', {
        trans_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wo_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        reason_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        trans_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'inventory_transactions',
        timestamps: false,
    });

    InventoryTransaction.associate = (db) => {
        if (db.Part) {
            InventoryTransaction.belongsTo(db.Part, { foreignKey: 'part_id', as: 'part' });
        }
    };

    return InventoryTransaction;
};
