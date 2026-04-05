import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ITSubCategory = sequelize.define('ITSubCategory', {
        sub_category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        it_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sub_category_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    }, {
        tableName: 'it_sub_categories',
        timestamps: false,
    });

    ITSubCategory.associate = (models) => {
        if (models.ITCategory) {
            ITSubCategory.belongsTo(models.ITCategory, {
                foreignKey: 'it_category_id',
                targetKey: 'it_category_id',
                as: 'category',
            });
        }
    };

    return ITSubCategory;
};
