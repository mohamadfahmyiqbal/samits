// models/1_user_management/Role.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Role = sequelize.define('Role', {
        // PK diubah menjadi role_id
        role_id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        // Nama kolom diubah dari 'name' menjadi 'role_name' [cite: 55]
        role_name: { 
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'roles'
    });

    Role.associate = (models) => {
        // Many-to-Many Role dan User melalui UserRole (FK: role_id) [cite: 49, 55]
        Role.belongsToMany(models.User, {
            through: models.UserRole,
            foreignKey: 'role_id', // FK di tabel junction adalah 'role_id'
            otherKey: 'nik', // FK lain adalah 'nik'
            as: 'users'
        });
    };

    return Role;
};