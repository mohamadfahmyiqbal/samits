// models/6_general_utility/Attachment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Attachment = sequelize.define('Attachment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        // Tambahkan field lain sesuai kebutuhan
    }, {
        tableName: 'attachments',
        timestamps: true,
    });

    return Attachment;
};
