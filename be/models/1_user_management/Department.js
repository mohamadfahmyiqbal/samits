// models/1_user_management/Department.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Department = sequelize.define('Department', {
        // PK diubah menjadi department_id
        department_id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        code: { // Ditambahkan sesuai ERD [cite: 55]
            type: DataTypes.STRING(10),
            allowNull: true,
            unique: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'departments'
    });

    Department.associate = (models) => {
        // Kolom department_id tidak ada lagi di tabel users, jadi asosiasi ini
        // dinonaktifkan untuk menghindari referensi ke kolom yang sudah dihapus.
        // Jika nanti ingin mengembalikan relasi, pastikan kolom tersebut tersedia kembali di schema.
    };

    return Department;
};
