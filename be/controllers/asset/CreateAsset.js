import { db, sequelize } from "../../models/index.js";
import AssetService from "../../services/asset.service.js";
import { loadAssetByNo } from "./shared.js";

export const createAsset = async (req, res) => {
  console.log("[CREATE ASSET] Using service layer");

  const transaction = await sequelize.transaction();
  const safeRollback = async () => transaction?.rollback().catch(console.error);

  try {
    const result = await AssetService.createAsset(req.body, req, transaction);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: result,
    });
  } catch (error) {
    await safeRollback();
    console.error("[CREATE ASSET] Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create asset",
    });
  }
};
