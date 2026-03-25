
import { db } from "../../models/index.js";
import { Op } from "sequelize";

export const listAssetGroups = async (req, res) => {
  try {
    const rawMainTypeId = req.query.main_type_id;
    const rawCategoryId = req.query.category_id;
    const rawSubCategoryId = req.query.sub_category_id;
    const mainTypeId = rawMainTypeId ? parseInt(rawMainTypeId, 10) : null;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : null;
    const subCategoryId = rawSubCategoryId ? parseInt(rawSubCategoryId, 10) : null;

    const ITCategory = db.ITCategory;
    const ITSubCategory = db.ITSubCategory;
    const ITAssetGroup = db.ITAssetGroup;

    if (!ITCategory) {
      return res.status(200).json({ data: [] });
    }

    let groups = [];

    // JIKA TIDAK ADA PARAMETER - Return semua asset groups dari database
    if (!mainTypeId && !categoryId && !subCategoryId) {
      if (ITAssetGroup) {
        // Ambil semua asset groups dengan join ke sub_categories
        const assetGroupRows = await ITAssetGroup.findAll({
          attributes: [
            "asset_group_id", 
            "sub_category_id", 
            "asset_group_name"
          ],
          include: [{
            model: ITSubCategory,
            as: "subCategory",
            attributes: ["it_category_id"],
            required: true,
            include: [{
              model: ITCategory,
              as: "category",
              attributes: ["asset_main_type_id"],
              required: true
            }]
          }],
          raw: false
        });
        
        groups = assetGroupRows
          .map((row) => ({
            asset_group_id: row.asset_group_id,
            sub_category_id: row.sub_category_id,
            category_id: row.subCategory?.it_category_id || null,
            asset_main_type_id: row.subCategory?.category?.asset_main_type_id || null,
            asset_group_name: String(row?.asset_group_name || "").trim()
          }))
          .filter(g => g.asset_group_name);
      } else {
        // Fallback: Ambil dari ITCategory.asset_group
        const categoryRows = await ITCategory.findAll({
          attributes: ["asset_group"],
          where: { 
            asset_group: { [Op.ne]: null },
          },
          raw: true,
        });
        groups = categoryRows.map((row) => ({ 
          asset_group_id: null,
          asset_group_name: String(row?.asset_group || "").trim() 
        })).filter(g => g.asset_group_name);
      }
    } else if (subCategoryId && !isNaN(subCategoryId)) {
      // Filter by sub_category_id
      if (ITAssetGroup) {
        const assetGroupRows = await ITAssetGroup.findAll({
          attributes: ["asset_group_id", "sub_category_id", "asset_group_name"],
          where: { sub_category_id: subCategoryId },
          raw: true,
        });
        
        groups = assetGroupRows
          .map((row) => ({
            asset_group_id: row.asset_group_id,
            sub_category_id: row.sub_category_id,
            asset_group_name: String(row?.asset_group_name || "").trim()
          }))
          .filter(g => g.asset_group_name);
      }
    } else if (categoryId && !isNaN(categoryId)) {
      // Fallback: query by category_id
      if (ITSubCategory) {
        const subCategoryRows = await ITSubCategory.findAll({
          attributes: ["sub_category_id"],
          where: { it_category_id: categoryId },
          raw: true,
        });
        const subCategoryIds = subCategoryRows.map(s => s.sub_category_id);
        
        if (ITAssetGroup && subCategoryIds.length > 0) {
          const assetGroupRows = await ITAssetGroup.findAll({
            attributes: ["asset_group_id", "sub_category_id", "asset_group_name"],
            where: { 
              sub_category_id: { [Op.in]: subCategoryIds }
            },
            raw: true,
          });
          groups = assetGroupRows
            .map((row) => ({
              asset_group_id: row.asset_group_id,
              sub_category_id: row.sub_category_id,
              asset_group_name: String(row?.asset_group_name || "").trim()
            }))
            .filter(g => g.asset_group_name);
        }
      }
    } else if (mainTypeId && !isNaN(mainTypeId)) {
      // Filter by main_type_id
      if (ITSubCategory && ITAssetGroup) {
        const subCategoryRows = await ITSubCategory.findAll({
          attributes: ["sub_category_id"],
          where: { it_category_id: { [Op.in]: db.Sequelize.literal(`(SELECT it_category_id FROM it_categories WHERE asset_main_type_id = ${mainTypeId})`) } },
          raw: true,
        });
        const subCategoryIds = subCategoryRows.map(s => s.sub_category_id);
        
        if (subCategoryIds.length > 0) {
          const assetGroupRows = await ITAssetGroup.findAll({
            attributes: ["asset_group_id", "sub_category_id", "asset_group_name"],
            where: { 
              sub_category_id: { [Op.in]: subCategoryIds }
            },
            raw: true,
          });
          groups = assetGroupRows
            .map((row) => ({
              asset_group_id: row.asset_group_id,
              sub_category_id: row.sub_category_id,
              asset_group_name: String(row?.asset_group_name || "").trim()
            }))
            .filter(g => g.asset_group_name);
        }
      }
    }

    // Remove duplicates by asset_group_name
    const uniqueGroupsMap = new Map();
    groups.forEach(g => {
      if (!uniqueGroupsMap.has(g.asset_group_name)) {
        uniqueGroupsMap.set(g.asset_group_name, g);
      }
    });
    const uniqueGroups = Array.from(uniqueGroupsMap.values());
    return res.status(200).json({ data: uniqueGroups });
  } catch (error) {
    console.error("List asset groups error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar asset groups." });
  }
};

// GET: /api/assets/main-types - Ambil daftar main types dari database
export const listMainTypes = async (req, res) => {
 try {
  let mainTypes = [];

  // Cek apakah tabel asset_main_types tersedia di db
  if (db.AssetMainType) {
   mainTypes = await db.AssetMainType.findAll({
    attributes: ["asset_main_type_id", "main_type_name"],
    where: {
     main_type_name: {
      [Op.ne]: null,
      [Op.ne]: "",
     },
    },
    order: [["main_type_name", "ASC"]],
    raw: true,
   });
  }

  return res.status(200).json({ data: mainTypes });
 } catch (error) {
  console.error("List main types error:", error);
  return res.status(500).json({ message: "Gagal mengambil daftar main types." });
 }
};

