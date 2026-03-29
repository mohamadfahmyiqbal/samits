import { db } from "../../models/index.js";
import { Op } from "sequelize";
import { HRGAUser } from "../../models/hrga/index.js";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const listItItems = async (req, res) => {
  try {
    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const categoryId = req.query.category_id
      ? Number(req.query.category_id)
      : null;
    const subCategoryId = req.query.sub_category_id
      ? Number(req.query.sub_category_id)
      : null;
    const mainTypeIdParam = req.query.main_type_id
      ? Number(req.query.main_type_id)
      : null;
    const assetGroupId = req.query.asset_group_id
      ? Number(req.query.asset_group_id)
      : null;
    const groupParam = req.query.group ? String(req.query.group).trim() : null;
    const targetGroup = String(groupParam || "").trim();

    // Build where clause
    const whereClause = {};

    if (mainTypeIdParam && !isNaN(mainTypeIdParam)) {
      whereClause.asset_main_type_id = mainTypeIdParam;
    }
    if (categoryId && !isNaN(categoryId)) {
      whereClause.category_id = categoryId;
    }
    if (subCategoryId && !isNaN(subCategoryId)) {
      whereClause.sub_category_id = subCategoryId;
    }
    if (assetGroupId && !isNaN(assetGroupId)) {
      whereClause.asset_group_id = assetGroupId;
    }

    // Query database
    const { count, rows } = await db.ITItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.ITCategory,
          as: "directCategory",
          attributes: ["it_category_id", "category_name"],
          required: false,
        },
        {
          model: db.ITSubCategory,
          as: "subCategory",
          attributes: ["sub_category_id", "sub_category_name"],
          required: false,
        },
        {
          model: db.ITAssetGroup,
          as: "assetGroup",
          attributes: ["asset_group_id", "asset_group_name"],
          required: false,
        },
        {
          model: db.AssetMainType,
          as: "mainType",
          attributes: ["asset_main_type_id", "main_type_name"],
          required: false,
        },
        {
          model: db.ITItemAssignment,
          as: "assignments",
          attributes: ["nik", "assigned_at"],
          required: false,
          // HRGAUser include removed temporarily due to column mismatch
        },
        {
          model: db.ITItemNetwork,
          as: "networks",
          attributes: ["hostname", "ip_address", "mac_address", "is_primary"],
          required: false,
        },
        {
          model: db.ITItemAttribute,
          as: "attributes",
          attributes: ["attr_name", "attr_value"],
          required: false,
        },
      ],
      order: [["asset_tag", "ASC"]],
      limit,
      offset,
      distinct: true,
    });

    // Transform data untuk frontend
    const data = rows.map((item) => {
      const category = item.directCategory;
      const subCategory = item.subCategory;
      const assetGroup = item.assetGroup;
      const mainType = item.mainType;
      const assignment = item.assignments?.[0];
      const networkMain =
        item.networks?.find((n) => n.is_primary) || item.networks?.[0];
      const networkBackup = item.networks?.find((n) => !n.is_primary);

      // Parse tahunBeli dari po_date_period (format YYYYMM -> YYYY)
      let tahunBeli = null;
      if (item.po_date_period && item.po_date_period.length >= 4) {
        tahunBeli = item.po_date_period.substring(0, 4);
      }

      return {
        it_item_id: item.it_item_id,
        noAsset: item.asset_tag,
        nama:
          item.attributes?.find((attr) => attr.attr_name === "nama")
            ?.attr_value || null,
        // Field names untuk AssetTable.jsx
        type: subCategory?.sub_category_name || category?.category_name || null,
        dept: null, // TODO: Fix HRGAUser
        nik: assignment?.nik || null,
        tahunBeli: tahunBeli,
        tahunDepreciation: item.useful_life_year,
        hostname: networkMain?.hostname || null,
        mainIpAdress: networkMain?.ip_address || null,
        backupIpAdress: networkBackup?.ip_address || null,
        status: item.current_status,
        // Original fields untuk reference
        category_id: item.category_id,
        sub_category_id: item.sub_category_id,
        category_name: category?.category_name || null,
        sub_category_name: subCategory?.sub_category_name || null,
        asset_group_id: item.asset_group_id,
        asset_group_name: assetGroup?.asset_group_name || null,
        asset_main_type_id: item.asset_main_type_id,
        main_type_name: mainType?.main_type_name || null,
        current_status: item.current_status,
        assigned_to: null, // TODO: Fix HRGAUser
        ip_address: networkMain?.ip_address || null,
        mac_address: networkMain?.mac_address || null,
        po_number: item.po_number,
        invoice_number: item.invoice_number,
        purchase_price_actual: item.purchase_price_actual,
        useful_life_year: item.useful_life_year,
        po_date_period: item.po_date_period,
        acquisition_status: item.acquisition_status,
        is_disposed: item.is_disposed,
      };
    });

    // Filter by group jika diperlukan (legacy compatibility)
    let filteredData = data;
    if (targetGroup) {
      const normalizedTargetGroup = normalizeText(targetGroup);
      filteredData = data.filter(
        (row) =>
          normalizeText(row?.main_type_name) === normalizedTargetGroup ||
          normalizeText(row?.asset_group_name) === normalizedTargetGroup,
      );
    }

    return res.status(200).json({
      success: true,
      message: "IT Items retrieved successfully",
      data: filteredData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("List it_items error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data it_item dari database.",
      error: error.message,
    });
  }
};
