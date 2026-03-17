// models/1_user_management/UserRole.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const UserRole = sequelize.define('UserRole', {
        // Kunci Asing NIK 
        nik: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'User',
                key: 'nik' // Mereferensikan PK di User
            }
        },
        // Kunci Asing Role ID 
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'Role',
                key: 'role_id' // Mereferensikan PK di Role
            }
        },
    }, {
        tableName: 'user_roles',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['nik', 'role_id']
            }
        ]
    });

    return UserRole;
};