import { Op } from "sequelize";
import { db } from "../../models/index.js";
import { assetDebugLog } from "./shared.js";

export const listCategoryTypes = async (req, res) => {
 
  try {
    const rawMainTypeId = req.query.asset_main_type_id;
    const mainTypeId = rawMainTypeId ? parseInt(rawMainTypeId, 10) : null;
    const rawCategoryId = req.query.category_id;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : null;
    
    assetDebugLog("listCategoryTypes:start", {
      mainTypeId,
      user: req.user?.nik || null,
      ip: req.ip,
   url: req.originalUrl,
  });
  
    const ITCategory = db.ITCategory;
    const ITSubCategory = db.ITSubCategory;
    if (!ITCategory || !ITSubCategory) {
      throw new Error("Model ITCategory/ITSubCategory belum tersedia.");
    }

    const whereClause = {
      category_name: { [Op.ne]: null },
    };

    if (mainTypeId && !isNaN(mainTypeId)) {
      whereClause.asset_main_type_id = mainTypeId;
    }
    if (categoryId && !isNaN(categoryId)) {
      whereClause.it_category_id = categoryId;
    }

    const rows = await ITCategory.findAll({
      attributes: ["it_category_id", "category_name", "asset_main_type_id"],
      where: whereClause,
      include: [
        {
          model: ITSubCategory,
          as: "subCategories",
          attributes: ["sub_category_id", "sub_category_name"],
          required: false,
        },
      ],
      order: [
        ["category_name", "ASC"],
        [{ model: ITSubCategory, as: "subCategories" }, "sub_category_name", "ASC"],
      ],
    });

    const data = rows.map((row) => {
      const subCategories = (row.subCategories || [])
        .map((sub) => ({
          sub_category_id: sub.sub_category_id,
          sub_category_name: sub.sub_category_name,
        }))
        .filter((sub) => Boolean(sub.sub_category_name));

      const result = {
        category: row.category_name,
        category_id: row.it_category_id,
        // Keep compatibility for existing frontend mapping.
        types: subCategories.map((sub) => sub.sub_category_name),
        sub_categories: subCategories,
      };
      return result;
    });

    assetDebugLog("listCategoryTypes:success", {
      mainTypeId,
      categoryId,
      totalRows: rows.length,
      totalCategories: data.length,
      firstCategory: data[0] || null,
    });

    return res.status(200).json({ data });
  } catch (error) {
    assetDebugLog("listCategoryTypes:error", {
      mainTypeId: req.query.asset_main_type_id ? parseInt(req.query.asset_main_type_id, 10) : null,
      categoryId: req.query.category_id ? parseInt(req.query.category_id, 10) : null,
      message: error.message,
    });
    console.error("List category types error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar kategori dan sub kategori dari database." });
  }
};
