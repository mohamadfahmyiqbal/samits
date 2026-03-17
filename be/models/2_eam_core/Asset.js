// models/2_eam_core/Asset.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
 const Asset = sequelize.define('Asset', {
  asset_id: {
   type: DataTypes.INTEGER,
   primaryKey: true,
   autoIncrement: true,
   allowNull: false,
  },
  asset_name: {
   type: DataTypes.STRING(150),
   allowNull: false,
  },
  category_id: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
  vendor_id: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
  location_id: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
  serial_number: {
   type: DataTypes.STRING(100),
   allowNull: true,
  },
  purchase_date: {
   type: DataTypes.DATEONLY,
   allowNull: true,
  },
  depreciation_date: {
   type: DataTypes.DATEONLY,
   allowNull: true,
  },
 }, {
  tableName: 'assets',
  timestamps: false, // Database tidak menggunakan createdAt/updatedAt
 });

 // Define associations
 Asset.associate = (models) => {
  if (models.Location) {
   Asset.belongsTo(models.Location, {
    foreignKey: 'location_id',
    targetKey: 'location_id',
    as: 'location',
   });
  }
  if (models.Vendor) {
   Asset.belongsTo(models.Vendor, {
    foreignKey: 'vendor_id',
    targetKey: 'vendor_id',
    as: 'vendor',
   });
  }
  if (models.ITSubCategory) {
   Asset.belongsTo(models.ITSubCategory, {
    foreignKey: 'category_id',
    targetKey: 'sub_category_id',
    as: 'subCategory',
   });
  }
  if (models.ITCategory) {
   Asset.belongsTo(models.ITCategory, {
    foreignKey: 'category_id',
    targetKey: 'it_category_id',
    as: 'category',
   });
  }
 };

 return Asset;
};
