// models/2_eam_core/Category.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Category = sequelize.define('Category', {
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        tableName: 'categories',
        timestamps: false,
    });

    return Category;
};
