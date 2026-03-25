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
    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    const mainTypeIdParam = req.query.main_type_id ? Number(req.query.main_type_id) : null;
    const groupParam = req.query.group ? String(req.query.group).trim() : null;
    const targetGroup = String(groupParam || "").trim();

    const ITItem = db.ITItem;
    const ITSubCategory = db.ITSubCategory;
    const ITCategory = db.ITCategory;
    const ITAssetGroup = db.ITAssetGroup;
    const AssetMainType = db.AssetMainType;
    const ITItemAssignment = db.ITItemAssignment;
    const ITItemAttribute = db.ITItemAttribute;
    const ITItemNetwork = db.ITItemNetwork;
    const ITItemStatusHistory = db.ITItemStatusHistory;

    if (!ITItem || !ITSubCategory || !ITCategory || !ITItemAssignment || !ITItemAttribute || !ITItemNetwork || !ITItemStatusHistory) {
      throw new Error("Model ITAM belum lengkap. Pastikan semua model ITItem tersedia.");
    }

    const itemWhere = {};
    if (Number.isInteger(categoryId)) itemWhere.category_id = categoryId;

    const mainTypeIdToName = new Map();
    if (AssetMainType) {
      const mainTypes = await AssetMainType.findAll({
        attributes: ["asset_main_type_id", "main_type_name"],
        raw: true,
      });
      mainTypes.forEach((row) => {
        const id = Number(row?.asset_main_type_id);
        if (!Number.isInteger(id)) return;
        const name = String(row?.main_type_name || "").trim();
        if (!name) return;
        mainTypeIdToName.set(id, name);
      });
    }

    const items = await ITItem.findAll({
      attributes: [
        "it_item_id",
        "asset_tag",
        "category_id",
        "asset_group_id",
        "asset_main_type_id",
        "po_date_period",
        "depreciation_end_date",
        "current_status"
      ],
      include: [
        {
          model: ITSubCategory,
          as: "subCategory",
          attributes: ["sub_category_id", "sub_category_name", "it_category_id"],
          required: false,
          include: [
        {
          model: ITCategory,
          as: "category",
          attributes: ["it_category_id", "category_name", "asset_group", "asset_type", "asset_main_type_id"],
          required: false,
        },
          ],
        },
        {
          model: ITCategory,
          as: "directCategory",
          attributes: ["it_category_id", "category_name", "asset_group", "asset_type", "asset_main_type_id"],
          required: false,
        },
        {
          model: ITAssetGroup,
          as: "assetGroup",
          attributes: ["asset_group_id", "asset_group_name", "sub_category_id"],
          required: false,
          include: [
            {
              model: ITSubCategory,
              as: "subCategory",
              attributes: ["sub_category_id", "it_category_id"],
              required: false,
              include: [
                {
                  model: ITCategory,
                  as: "category",
                  attributes: ["it_category_id", "asset_main_type_id"],
                  required: false,
                },
              ],
            },
          ],
        },
        { model: db.ITItemAssignment, as: 'assignments' },
        { model: db.ITItemAttribute, as: 'attributes' },
        { model: db.ITItemNetwork, as: 'networks' },
        { model: db.ITItemStatusHistory, as: 'statusHistory' },
      ],
      where: itemWhere,
      order: [["asset_tag", "ASC"]],
    });

    const latestAssignments = items.map((item) => {
      const assignments = Array.isArray(item.assignments) ? item.assignments : [];
      const latestAssignment = assignments
        .slice()
        .sort((a, b) => {
          const aOpen = !a?.returned_at;
          const bOpen = !b?.returned_at;
          if (aOpen !== bOpen) return aOpen ? -1 : 1;

          const aAssigned = a?.assigned_at ? new Date(a.assigned_at).getTime() : 0;
          const bAssigned = b?.assigned_at ? new Date(b.assigned_at).getTime() : 0;
          if (aAssigned !== bAssigned) return bAssigned - aAssigned;

          return (b?.id || 0) - (a?.id || 0);
        })[0];

      return {
        itemId: item.it_item_id,
        nik: String(latestAssignment?.nik || "").trim(),
      };
    });

    const nikSet = new Set(latestAssignments.map((entry) => entry.nik).filter(Boolean));
    const nikList = Array.from(nikSet);

    const hrgaUserMap = new Map();
    if (nikList.length > 0) {
      let hrgaUsers = [];
      try {
        hrgaUsers = await HRGAUser.findAll({
          attributes: ["NIK", "NAMA", "DEPT", "DIVISI"],
          where: { NIK: { [Op.in]: nikList } },
          raw: true,
        });
      } catch (_) {
        // Fallback jika kolom DIVISI belum ada di tabel HRGA.
        hrgaUsers = await HRGAUser.findAll({
          attributes: ["NIK", "NAMA", "DEPT"],
          where: { NIK: { [Op.in]: nikList } },
          raw: true,
        });
      }

      hrgaUsers.forEach((user) => {
        const nikKey = String(user?.NIK || "").trim();
        if (nikKey) {
          hrgaUserMap.set(nikKey, user);
        }
      });
    }

    // Map data to match frontend expectations
    const rows = items.map((item) => {
      const subCategory = item.subCategory || null;
      const categoryFromSub = subCategory?.category || null;
      const categoryDirect = item.directCategory || null;
      const assetGroupRel = item.assetGroup || null;
      const categoryFromAssetGroup = assetGroupRel?.subCategory?.category || null;
      const assignments = Array.isArray(item.assignments) ? item.assignments : [];
      const networks = Array.isArray(item.networks) ? item.networks : [];

      const category = categoryFromSub?.category_name || categoryDirect?.category_name || "Unknown";
      const type =
        subCategory?.sub_category_name ||
        categoryFromSub?.asset_type ||
        categoryDirect?.asset_type ||
        category ||
        "Unknown";
      const resolvedMainTypeId =
        item?.asset_main_type_id ??
        categoryFromSub?.asset_main_type_id ??
        categoryDirect?.asset_main_type_id ??
        categoryFromAssetGroup?.asset_main_type_id ??
        null;

      // Determine assetGroup - prioritize: assetGroup relation > category asset_group > fallback to asset_main_type_id
      let assetGroup = "";
      if (assetGroupRel?.asset_group_name) {
        assetGroup = String(assetGroupRel.asset_group_name).trim();
      }
      if (!assetGroup && categoryFromSub?.asset_group) {
        assetGroup = String(categoryFromSub.asset_group).trim();
      }
      if (!assetGroup && categoryDirect?.asset_group) {
        assetGroup = String(categoryDirect.asset_group).trim();
      }
      // Fallback ke asset_main_type_id jika asset_group masih kosong
      if (!assetGroup && categoryFromSub?.asset_main_type_id) {
        assetGroup = mainTypeIdToName.get(Number(categoryFromSub.asset_main_type_id)) || "";
      }
      if (!assetGroup && categoryDirect?.asset_main_type_id) {
        assetGroup = mainTypeIdToName.get(Number(categoryDirect.asset_main_type_id)) || "";
      }
      if (!assetGroup && item?.asset_main_type_id) {
        assetGroup = mainTypeIdToName.get(Number(item.asset_main_type_id)) || "";
      }

      const noAsset = String(item.asset_tag || item.it_item_id || "").trim();

      const latestAssignment = assignments
        .slice()
        .sort((a, b) => {
          const aOpen = !a?.returned_at;
          const bOpen = !b?.returned_at;
          if (aOpen !== bOpen) return aOpen ? -1 : 1;

          const aAssigned = a?.assigned_at ? new Date(a.assigned_at).getTime() : 0;
          const bAssigned = b?.assigned_at ? new Date(b.assigned_at).getTime() : 0;
          if (aAssigned !== bAssigned) return bAssigned - aAssigned;

          return (b?.id || 0) - (a?.id || 0);
        })[0];

      const primaryNetwork = networks
        .slice()
        .sort((a, b) => {
          const aPrimary = Boolean(a?.is_primary);
          const bPrimary = Boolean(b?.is_primary);
          if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;

          const aUpdated = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bUpdated = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
          if (aUpdated !== bUpdated) return bUpdated - aUpdated;

          return (b?.network_id || 0) - (a?.network_id || 0);
        })[0];

      // Secondary network (backup IP)
      const sortedNetworks = networks.slice().sort((a, b) => {
        const aPrimary = Boolean(a?.is_primary);
        const bPrimary = Boolean(b?.is_primary);
        if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;
        const aUpdated = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bUpdated = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
        if (aUpdated !== bUpdated) return bUpdated - aUpdated;
        return (b?.network_id || 0) - (a?.network_id || 0);
      });
      const secondaryNetwork = sortedNetworks[1] || null;

      const tahunBeli = item.po_date_period ? String(item.po_date_period).slice(0,4) : null;
      const tahunDepreciation = item.useful_life_year ? Number(item.useful_life_year) : null;
      const nik = String(latestAssignment?.nik || "").trim();
      const hrgaUser = hrgaUserMap.get(nik);
      
      // Get nama from attributes (priority)
      const namaAttr = item.attributes?.find(attr => attr.attr_name === 'nama');
      const nama = String(namaAttr?.attr_value || '').trim() || String(hrgaUser?.NAMA || "").trim();
      
      const dept = String(hrgaUser?.DEPT || "").trim();
      const divisi = String(hrgaUser?.DIVISI || hrgaUser?.DEPT || "").trim();

      return {
        id: item.it_item_id,
        noAsset: noAsset || String( ""),
        type,
        divisi,
        dept,
        nama,
        nik,
        hostname: String(primaryNetwork?.hostname || "").trim(),
        tahunBeli,
        tahunDepreciation,
        mainIpAdress: String(primaryNetwork?.ip_address || "").trim(),
        backupIpAdress: String(secondaryNetwork?.ip_address || "").trim(),
        category,
        status: item.current_status,
        asset_main_type_id: resolvedMainTypeId,
        assetGroup,
        asset_group_id: item.asset_group_id || assetGroupRel?.asset_group_id || null,
      };
    });

    let filteredRows = rows;
    if (Number.isInteger(mainTypeIdParam) && mainTypeIdParam > 0) {
      filteredRows = filteredRows.filter(
        (row) => Number(row?.asset_main_type_id || 0) === Number(mainTypeIdParam)
      );
    }

    if (targetGroup) {
      const normalizedTargetGroup = normalizeText(targetGroup);
      filteredRows = filteredRows.filter((row) => normalizeText(row?.assetGroup) === normalizedTargetGroup);
    }

    return res.status(200).json({ 
      success: true, 
      message: "IT Items retrieved successfully", 
      data: filteredRows 
    });
  } catch (error) {
    console.error("List it_items error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil data it_item dari database." 
    });
  }
};
