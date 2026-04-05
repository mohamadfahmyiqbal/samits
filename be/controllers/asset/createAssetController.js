import { db, sequelize } from "../../models/index.js";
import AssetService from "../../services/asset.service.js";
import { loadAssetByNo } from "./shared.js";

export const createAsset = async (req, res) => {
  console.log("[CREATE ASSET] Using service layer");

  const transaction = await sequelize.transaction();
  const safeRollback = async () => transaction?.rollback().catch(console.error);

  try {
    const payload = req.body || {};
    const noAsset = payload.noAsset?.trim();

    if (!noAsset) {
      await safeRollback();
      return res.status(400).json({
        success: false,
        message: "Nomor Asset wajib diisi",
      });
    }

    // Service handles everything: validation, duplicate check, DB ops, files
    const result = await AssetService.createAsset(payload, req, transaction);

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Asset berhasil dibuat",
      data: result,
    });
  } catch (error) {
    await safeRollback();
    console.error("CREATE ASSET ERROR:", error);

    const status = error.message.includes("sudah ada") ? 409 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
