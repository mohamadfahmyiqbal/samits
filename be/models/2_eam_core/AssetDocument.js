import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AssetDocument = sequelize.define(
    "AssetDocument",
    {
      document_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      it_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      document_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      uploaded_by: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "asset_documents",
      timestamps: false,
    }
  );

  AssetDocument.associate = (models) => {
    if (models.ITItem) {
      AssetDocument.belongsTo(models.ITItem, {
        foreignKey: "it_item_id",
        targetKey: "it_item_id",
        as: "item",
      });
    }
  };

  return AssetDocument;
};
