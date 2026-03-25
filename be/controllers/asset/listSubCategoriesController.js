import { db } from "../../models/index.js";
import { Op } from "sequelize";

export const listSubCategories = async (req, res) => {
  try {
    const rawCategoryId = req.query.category_id;
    const rawMainTypeId = req.query.asset_main_type_id;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : null;
    const mainTypeId = rawMainTypeId ? parseInt(rawMainTypeId, 10) : null;

    const ITCategory = db.ITCategory;
    const ITSubCategory = db.ITSubCategory;
    if (!ITSubCategory) {
      throw new Error("Model ITSubCategory belum tersedia.");
    }

    // Jika mainTypeId provided, first find category_id(s) from ITCategory
    let categoryIds = [];
    if (mainTypeId && !isNaN(mainTypeId) && ITCategory) {
      const categories = await ITCategory.findAll({
        attributes: ["it_category_id"],
        where: {
          it_category_id: categoryId ? categoryId : { [Op.ne]: null },
          asset_main_type_id: mainTypeId,
        },
        raw: true,
      });
      categoryIds = categories.map(c => c.it_category_id);
    } else if (categoryId && !isNaN(categoryId)) {
      categoryIds = [categoryId];
    }

    const whereClause = {};
    if (categoryIds.length > 0) {
      whereClause.it_category_id = { [Op.in]: categoryIds };
    } else if (categoryId && !isNaN(categoryId)) {
      whereClause.it_category_id = categoryId;
    }
    
    const rows = await ITSubCategory.findAll({
      where: whereClause,
      order: [["it_category_id", "ASC"], ["sub_category_name", "ASC"]],
    });

    return res.status(200).json({ rows });
  } catch (error) {
    console.error("List sub categories error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar sub kategori dari database." });
  }
};
