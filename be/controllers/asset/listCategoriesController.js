import { Op } from "sequelize";
import { db } from "../../models/index.js";
import { assetDebugLog } from "./shared.js";

export const listCategories = async (req, res) => {
  try {
    const groupName = req.query.group ? String(req.query.group).trim() : null;
    const rawMainTypeId = req.query.asset_main_type_id;
    const mainTypeId = rawMainTypeId ? parseInt(rawMainTypeId, 10) : null;
    const rawCategoryId = req.query.category_id;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : null;

    assetDebugLog("listCategories:start", {
      groupName,
      mainTypeId,
      categoryId,
      user: req.user?.nik || null,
      ip: req.ip,
      url: req.originalUrl,
    });

    const ITCategory = db.ITCategory;
    if (!ITCategory) {
      throw new Error("Model ITCategory belum tersedia.");
    }

    const whereClause = {
      category_name: { [Op.ne]: null },
    };

    if (groupName) {
      whereClause.asset_group = groupName;
    }
    if (mainTypeId && !isNaN(mainTypeId)) {
      whereClause.asset_main_type_id = mainTypeId;
    }
    if (categoryId && !isNaN(categoryId)) {
      whereClause.it_category_id = categoryId;
    }

    const rows = await ITCategory.findAll({
      attributes: ["it_category_id", "category_name", "asset_main_type_id", "asset_group"],
      where: whereClause,
      order: [["category_name", "ASC"]],
    });

    const data = rows.map((row) => ({
      category: row.category_name,
      category_id: row.it_category_id,
      asset_main_type_id: row.asset_main_type_id,
      asset_group: row.asset_group,
    }));

    assetDebugLog("listCategories:success", {
      groupName,
      mainTypeId,
      categoryId,
      totalRows: data.length,
    });

    return res.status(200).json({ data });
  } catch (error) {
    assetDebugLog("listCategories:error", {
      groupName: req.query.group ? String(req.query.group).trim() : null,
      mainTypeId: req.query.asset_main_type_id ? parseInt(req.query.asset_main_type_id, 10) : null,
      categoryId: req.query.category_id ? parseInt(req.query.category_id, 10) : null,
      message: error.message,
    });
    console.error("List categories error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar kategori dari database." });
  }
};
