import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITItemNetwork = sequelize.define('ITItemNetwork', {
        network_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        it_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        hostname: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        mac_address: {
            type: DataTypes.STRING(17),
            allowNull: true,
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'it_item_networks',
        timestamps: false,
    });

    ITItemNetwork.associate = (models) => {
        if (models.ITItem) {
            ITItemNetwork.belongsTo(models.ITItem, {
                foreignKey: 'it_item_id',
                targetKey: 'it_item_id',
                as: 'item',
            });
        }
    };

    return ITItemNetwork;
};
