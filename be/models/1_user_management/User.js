// models/1_user_management/User.js (Koreksi Final)
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
    const User = sequelize.define('User', {
        nik: {
            // Disesuaikan dengan skema SQL Server Anda (varchar)
            type: DataTypes.STRING(20), 
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        nama: { 
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        // KOREKSI: Menggunakan nama kolom 'password'
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
        },
        phone: { 
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        // KOREKSI: Kolom baru 'position'
        position: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        // KOREKSI: Kolom 'status' sekarang memetakan timestamp (terlihat dari DB existing)
        status: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        // KOREKSI: Kolom baru 'last_login'
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Kolom lama (department_id, level_name, token) dihilangkan
    }, {
        tableName: 'users',
        timestamps: false, 
        hooks: {
            // KOREKSI: Hooks disesuaikan untuk kolom 'password'
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // KOREKSI: Hapus asosiasi yang mereferensi kolom yang sudah tidak ada
    User.associate = (models) => {
        // Asosiasi dikosongkan karena foreign key (department_id, dll) sudah dihapus dari skema baru.
    };

    return User;
};
