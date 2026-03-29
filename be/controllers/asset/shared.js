import { db } from "../../models/index.js";
import { Op, QueryTypes } from "sequelize";
import {
  HRGA as HRGAConnection,
  HRGAUser as HRGAUserExternal,
} from "../../models/hrga/index.js";

const isAssetDebugEnabled = () => {
  const value = String(process.env.DEBUG_ASSET || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
};

export const assetDebugLog = (label, payload = {}) => {
  if (!isAssetDebugEnabled()) return;
  console.log(`[ASSET_DEBUG] ${label}`, payload);
};

const getCaseInsensitiveOperator = () => {
  const dialect = db?.sequelize?.getDialect?.();
  return dialect === "postgres" ? Op.iLike : Op.like;
};

const cleanLookupText = (value) =>
  String(value || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    const cleaned = cleanLookupText(value);
    if (cleaned) return cleaned;
  }
  return "";
};

const getAssetGroupCandidates = (rawValue) => {
  const cleaned = cleanLookupText(rawValue);
  if (!cleaned) return [];

  const normalized = cleaned.toLowerCase();
  const values = new Set([cleaned]);

  if (
    ["asset utama", "aset utama", "utama", "main", "primary"].includes(
      normalized,
    )
  ) {
    values.add("ASSET UTAMA");
    values.add("Utama");
    values.add("utama");
  }

  if (["client", "klien"].includes(normalized)) {
    values.add("CLIENT");
    values.add("Client");
    values.add("client");
  }

  return Array.from(values);
};

const getLatestAssignmentSubquery = () => {
  const dialect = db?.sequelize?.getDialect?.();

  if (dialect === "postgres") {
    return db.sequelize.literal(`(
      SELECT ia.id, ia.it_item_id, ia.nik, ia.assigned_at
      FROM it_item_assignments ia
      WHERE ia.returned_at IS NULL
      ORDER BY COALESCE(ia.assigned_at, NOW()) DESC, ia.id DESC
      LIMIT 1
    )`);
  }

  // SQL Server / MySQL
  return db.sequelize.literal(`(
    SELECT TOP 1 ia.id, ia.it_item_id, ia.nik, ia.assigned_at
    FROM it_item_assignments ia
    WHERE ia.returned_at IS NULL
    ORDER BY COALESCE(ia.assigned_at, GETDATE()) DESC, ia.id DESC
  )`);
};

const buildAssetListQuery = (filters = {}) => {
  const {
    groupName = null,
    categoryId = null,
    subCategoryId = null,
    categoryName = null,
    typeName = null,
  } = filters;

  const ciOp = getCaseInsensitiveOperator();
  const whereConditions = [];

  // Build category include
  const categoryInclude = {
    model: db.ITCategory,
    as: "category",
    required: false,
    attributes: [
      "it_category_id",
      "category_name",
      "asset_type",
      "asset_group",
    ],
  };

  // Build subcategory include with category
  const subCategoryInclude = {
    model: db.ITSubCategory,
    as: "subCategory",
    required: false,
    include: [categoryInclude],
    attributes: ["sub_category_id", "sub_category_name"],
  };

  // Build direct category include
  const directCategoryInclude = {
    model: db.ITCategory,
    as: "directCategory",
    required: false,
    attributes: [
      "it_category_id",
      "category_name",
      "asset_type",
      "asset_group",
    ],
  };

  // Filter by groupName
  if (groupName) {
    const groupLower = groupName.toLowerCase();
    whereConditions.push({
      [Op.or]: [
        { "$subCategory.category.asset_group$": { [ciOp]: groupLower } },
        { "$directCategory.asset_group$": { [ciOp]: groupLower } },
      ],
    });
  }

  // Filter by categoryId
  if (categoryId) {
    whereConditions.push({
      [Op.or]: [
        { "$subCategory.category.it_category_id$": categoryId },
        { "$directCategory.it_category_id$": categoryId },
      ],
    });
  }

  // Filter by subCategoryId
  if (subCategoryId) {
    whereConditions.push({
      sub_category_id: subCategoryId,
    });
  }

  // Filter by categoryName
  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    whereConditions.push({
      [Op.or]: [
        { "$subCategory.category.category_name$": { [ciOp]: catLower } },
        { "$directCategory.category_name$": { [ciOp]: catLower } },
      ],
    });
  }

  // Filter by typeName (sub_category_name or asset_type)
  if (typeName) {
    const typeLower = typeName.toLowerCase();
    whereConditions.push({
      [Op.or]: [
        { "$subCategory.sub_category_name$": { [ciOp]: typeLower } },
        { "$subCategory.category.asset_type$": { [ciOp]: typeLower } },
        { "$directCategory.asset_type$": { [ciOp]: typeLower } },
        { "$subCategory.category.category_name$": { [ciOp]: typeLower } },
        { "$directCategory.category_name$": { [ciOp]: typeLower } },
      ],
    });
  }

  return {
    subCategory: subCategoryInclude,
    directCategory: directCategoryInclude,
    where: whereConditions.length > 0 ? { [Op.and]: whereConditions } : {},
  };
};

export const getListOptions = (filters = {}) => {
  const { subCategory, directCategory, where } = buildAssetListQuery(filters);

  return {
    model: db.ITItem,
    as: "itItem",
    where,
    include: [subCategory, directCategory],
    order: [[db.sequelize.col("noAsset"), "ASC"]],
  };
};

export const getDetailOptions = (assetNo) => {
  const ciOp = getCaseInsensitiveOperator();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(assetNo || "").trim(),
    );

  const whereClause = {
    [Op.or]: [{ asset_tag: assetNo }, { accounting_asset_no: assetNo }],
  };

  if (isUuid) {
    whereClause[Op.or].push({ it_item_id: assetNo });
  }

  return {
    where: whereClause,
    include: [
      {
        model: db.ITSubCategory,
        as: "subCategory",
        include: [
          {
            model: db.ITCategory,
            as: "category",
            required: false,
          },
        ],
      },
      {
        model: db.ITCategory,
        as: "directCategory",
        required: false,
      },
      {
        model: db.ITItemAssignment,
        as: "assignments",
        required: false,
        where: { returned_at: null },
        required: false,
      },
      {
        model: db.ITItemNetwork,
        as: "networks",
        required: false,
      },
      {
        model: db.ITItemAttribute,
        as: "attributes",
        required: false,
      },
      {
        model: db.ITItemStatusHistory,
        as: "statusHistory",
        required: false,
      },
      ...(db.ITItemSoftware
        ? [
            {
              model: db.ITItemSoftware,
              as: "softwares",
              required: false,
              where: { is_active: true },
              required: false,
            },
          ]
        : []),
    ],
  };
};

export const resolveSubCategoryId = async (asset, transaction) => {
  const typeName = pickFirstNonEmpty(
    asset?.type,
    asset?.sub_category,
    asset?.subCategory,
    asset?.sub_category_name,
    asset?.subCategoryName,
  );
  const categoryName = pickFirstNonEmpty(
    asset?.category,
    asset?.category_name,
    asset?.categoryName,
  );
  const assetGroupCandidates = getAssetGroupCandidates(
    pickFirstNonEmpty(asset?.assetGroup, asset?.asset_group, asset?.group),
  );
  const ciOp = getCaseInsensitiveOperator();

  const ITSubCategory = db.ITSubCategory;
  const ITCategory = db.ITCategory;

  const buildCategoryWhere = ({
    includeCategory,
    includeGroup,
    wildcard = false,
  } = {}) => {
    const whereClause = {};
    if (includeCategory && categoryName) {
      whereClause.category_name = {
        [ciOp]: wildcard ? `%${categoryName}%` : categoryName,
      };
    }

    if (includeGroup && assetGroupCandidates.length > 0) {
      whereClause[Op.or] = assetGroupCandidates.map((groupName) => ({
        asset_group: { [ciOp]: groupName },
      }));
    }

    return Object.keys(whereClause).length > 0 ? whereClause : null;
  };

  const findSubByType = async ({
    wildcard = false,
    includeCategory = false,
    includeGroup = false,
  } = {}) => {
    if (!typeName) return null;

    const categoryWhere = buildCategoryWhere({
      includeCategory,
      includeGroup,
      wildcard,
    });
    const whereClause = {
      sub_category_name: { [ciOp]: wildcard ? `%${typeName}%` : typeName },
    };

    return ITSubCategory.findOne({
      where: whereClause,
      include: [
        {
          model: ITCategory,
          as: "category",
          where: categoryWhere || undefined,
          required: Boolean(categoryWhere),
        },
      ],
      order: [["sub_category_id", "ASC"]],
      transaction,
    });
  };

  const strictTypeAttempts = [
    { wildcard: false, includeCategory: true, includeGroup: true },
    { wildcard: false, includeCategory: true, includeGroup: false },
    { wildcard: false, includeCategory: false, includeGroup: true },
    { wildcard: false, includeCategory: false, includeGroup: false },
    { wildcard: true, includeCategory: true, includeGroup: true },
    { wildcard: true, includeCategory: true, includeGroup: false },
    { wildcard: true, includeCategory: false, includeGroup: true },
    { wildcard: true, includeCategory: false, includeGroup: false },
  ];

  for (const attempt of strictTypeAttempts) {
    const found = await findSubByType(attempt);
    if (found) {
      return found.sub_category_id;
    }
  }

  if (categoryName) {
    const categoryWhereWithGroup = buildCategoryWhere({
      includeCategory: true,
      includeGroup: true,
    });
    const categoryWhereOnly = buildCategoryWhere({
      includeCategory: true,
      includeGroup: false,
    });

    if (categoryWhereWithGroup) {
      const fromCategoryWithGroup = await ITSubCategory.findOne({
        include: [
          {
            model: ITCategory,
            as: "category",
            where: categoryWhereWithGroup,
            required: true,
          },
        ],
        order: [["sub_category_id", "ASC"]],
        transaction,
      });
      if (fromCategoryWithGroup) {
        return fromCategoryWithGroup.sub_category_id;
      }
    }

    if (categoryWhereOnly) {
      const fromCategoryOnly = await ITSubCategory.findOne({
        include: [
          {
            model: ITCategory,
            as: "category",
            where: categoryWhereOnly,
            required: true,
          },
        ],
        order: [["sub_category_id", "ASC"]],
        transaction,
      });
      if (fromCategoryOnly) {
        return fromCategoryOnly.sub_category_id;
      }
    }
  }

  if (assetGroupCandidates.length > 0) {
    const groupWhere = buildCategoryWhere({
      includeCategory: false,
      includeGroup: true,
    });
    const fromGroup = await ITSubCategory.findOne({
      include: [
        {
          model: ITCategory,
          as: "category",
          where: groupWhere || undefined,
          required: Boolean(groupWhere),
        },
      ],
      order: [["sub_category_id", "ASC"]],
      transaction,
    });
    if (fromGroup) {
      return fromGroup.sub_category_id;
    }
  }

  throw new Error(
    `Sub kategori tidak ditemukan. type="${typeName || "-"}", category="${categoryName || "-"}", assetGroup="${assetGroupCandidates[0] || "-"}". Cek data master it_categories / it_sub_categories.`,
  );
};

export const resolveCategoryId = async (asset, subCategoryId, transaction) => {
  const ITCategory = db.ITCategory;
  const ITSubCategory = db.ITSubCategory;
  const ciOp = getCaseInsensitiveOperator();

  // First try: get from subCategoryId
  if (subCategoryId) {
    const fromSubCategory = await ITSubCategory.findOne({
      where: { sub_category_id: subCategoryId },
      include: [
        {
          model: ITCategory,
          as: "category",
          required: false,
        },
      ],
      transaction,
    });

    if (fromSubCategory && fromSubCategory.category) {
      return fromSubCategory.category.it_category_id;
    }
  }

  // Second try: find by categoryName
  const categoryName = pickFirstNonEmpty(
    asset?.category,
    asset?.category_name,
    asset?.categoryName,
  );
  const assetGroupCandidates = getAssetGroupCandidates(
    pickFirstNonEmpty(asset?.assetGroup, asset?.asset_group, asset?.group),
  );

  if (categoryName) {
    const whereClause = { category_name: { [ciOp]: categoryName } };
    if (assetGroupCandidates.length > 0) {
      whereClause[Op.or] = assetGroupCandidates.map((groupName) => ({
        asset_group: { [ciOp]: groupName },
      }));
    }

    const fromCategory = await ITCategory.findOne({
      where: whereClause,
      order: [["it_category_id", "ASC"]],
      transaction,
    });

    if (fromCategory) {
      return fromCategory.it_category_id;
    }

    const fallbackByCategory = await ITCategory.findOne({
      where: { category_name: { [ciOp]: categoryName } },
      order: [["it_category_id", "ASC"]],
      transaction,
    });
    if (fallbackByCategory) {
      return fallbackByCategory.it_category_id;
    }
  }

  return null;
};

export const resolveClassificationId = async (transaction) => {
  const ITClassification = db.ITClassification;

  if (!ITClassification) {
    throw new Error("Model ITClassification belum tersedia.");
  }

  const classification = await ITClassification.findOne({
    order: [["classification_id", "ASC"]],
    transaction,
  });

  if (!classification) {
    throw new Error("Data master it_classifications tidak ditemukan.");
  }

  return classification.classification_id;
};

const getActiveAssignment = (assignments = []) => {
  const activeAssignments = assignments.filter((a) => !a.returned_at);
  if (activeAssignments.length === 0) return null;

  return activeAssignments.reduce((latest, current) => {
    const latestTime = latest.assigned_at
      ? new Date(latest.assigned_at).getTime()
      : 0;
    const currentTime = current.assigned_at
      ? new Date(current.assigned_at).getTime()
      : 0;
    return currentTime > latestTime ? current : latest;
  });
};

const getPrimaryNetwork = (networks = []) => {
  if (networks.length === 0) return null;

  // Sort: primary first, then by updated_at
  const sorted = [...networks].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return bUpdated - aUpdated;
  });

  return sorted[0];
};

const getLatestStatus = (statusHistory = []) => {
  if (statusHistory.length === 0) return null;

  return statusHistory.reduce((latest, current) => {
    const latestTime = latest.changed_at
      ? new Date(latest.changed_at).getTime()
      : 0;
    const currentTime = current.changed_at
      ? new Date(current.changed_at).getTime()
      : 0;
    return currentTime > latestTime ? current : latest;
  });
};

export const loadAssetByNo = async (assetNo, transaction) => {
  const ITItem = db.ITItem;
  const ITSubCategory = db.ITSubCategory;
  const ITCategory = db.ITCategory;
  const AssetDocument = db.AssetDocument;
  const ITItemAssignment = db.ITItemAssignment;
  const ITItemNetwork = db.ITItemNetwork;
  const ITItemAttribute = db.ITItemAttribute;
  const ITItemSoftware = db.ITItemSoftware;
  const ITItemStatusHistory = db.ITItemStatusHistory;
  const HRGAUser = HRGAUserExternal || db.HRGAUser;
  const ciOp = getCaseInsensitiveOperator();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(assetNo || "").trim(),
    );

  const whereOr = [{ asset_tag: assetNo }, { accounting_asset_no: assetNo }];
  if (isUuid) whereOr.push({ it_item_id: assetNo });

  const itemIncludes = [
    {
      model: ITSubCategory,
      as: "subCategory",
      include: [
        {
          model: ITCategory,
          as: "category",
          required: false,
        },
      ],
    },
    {
      model: ITCategory,
      as: "directCategory",
      required: false,
    },
    {
      model: db.ITAssetGroup,
      as: "assetGroup",
      required: false,
    },
    {
      model: ITItemAssignment,
      as: "assignments",
      required: false,
    },
    {
      model: ITItemNetwork,
      as: "networks",
      required: false,
    },
    {
      model: ITItemAttribute,
      as: "attributes",
      required: false,
    },
    {
      model: ITItemStatusHistory,
      as: "statusHistory",
      required: false,
    },
  ];

  // Only add optional includes if the model exists and is defined
  // This prevents SQL errors when the underlying tables don't exist yet
  try {
    if (ITItemSoftware) {
      itemIncludes.push({
        model: ITItemSoftware,
        as: "softwares",
        required: false,
      });
    }
    if (AssetDocument) {
      itemIncludes.push({
        model: AssetDocument,
        as: "documents",
        required: false,
      });
    }
  } catch (includeError) {
    console.warn("Optional includes not available:", includeError.message);
  }

  let item;
  try {
    item = await ITItem.findOne({
      where: {
        [Op.or]: whereOr,
      },
      include: itemIncludes,
      transaction,
    });
  } catch (queryError) {
    // If query fails due to missing tables, try without optional includes
    const minimalIncludes = itemIncludes.filter(
      (inc) => !["softwares", "documents"].includes(inc.as),
    );

    console.warn(
      "Full query failed, retrying without optional tables:",
      queryError.message,
    );
    item = await ITItem.findOne({
      where: {
        [Op.or]: whereOr,
      },
      include: minimalIncludes,
      transaction,
    });
  }

  if (!item) return null;

  // Get latest assignment (not returned)
  const latestAssignment = getActiveAssignment(item.assignments || []);

  // Get primary network
  const primaryNetwork = getPrimaryNetwork(item.networks || []);
  const secondaryNetwork =
    (Array.isArray(item.networks) ? item.networks : [])
      .filter((n) => !Boolean(n?.is_primary))
      .sort((a, b) => {
        const aUpdated = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bUpdated = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bUpdated - aUpdated;
      })[0] || null;

  // Build result matching the original SQL structure
  const subCategory = item.subCategory || null;
  const categoryFromSub = subCategory?.category || null;
  const categoryDirect = item.directCategory || null;

  // Get employee info from HRGADB + FALLBACK attributes (FIXED)

  // 1. Define attributes EARLY
  const attributes = item.attributes || [];
  const nik = cleanLookupText(latestAssignment?.nik || "");

  // DEBUG LOGGING
  assetDebugLog("loadAssetByNo", {
    assetNo,
    hasActiveAssignment: !!latestAssignment,
    nik,
    it_item_id: item.it_item_id,
  });

  // 2. Inisialisasi ONCE
  let employeeInfo = { DEPT: "", NAMA: "", DIVISI: "" };
  let hrgaEmployeeFound = false;
  let deptFromAttr = "";

  // Priority 1: HRGA lookup (konsolidasi - hapus duplikasi)
  if (nik && (HRGAUser || HRGAConnection)) {
    try {
      console.log("[HRGA_QUERY]", { nik_searched: nik.trim(), assetNo });
      const normalizedNik = String(nik || "").trim();
      const normalizedNikDigits = normalizedNik.replace(/\D/g, "");
      let hrUser = await HRGAUser.findOne({
        attributes: ["NIK", "NAMA", "DEPT"],
        where: {
          NIK: normalizedNik,
        },
      });
      if (!hrUser && normalizedNik) {
        hrUser = await HRGAUser.findOne({
          attributes: ["NIK", "NAMA", "DEPT"],
          where: db.Sequelize.where(
            db.Sequelize.fn(
              "RTRIM",
              db.Sequelize.fn("LTRIM", db.Sequelize.col("NIK")),
            ),
            normalizedNik,
          ),
        });
      }
      if (!hrUser && normalizedNikDigits) {
        hrUser = await HRGAUser.findOne({
          attributes: ["NIK", "NAMA", "DEPT"],
          where: db.Sequelize.where(
            db.Sequelize.fn(
              "REPLACE",
              db.Sequelize.fn(
                "REPLACE",
                db.Sequelize.fn(
                  "REPLACE",
                  db.Sequelize.fn(
                    "RTRIM",
                    db.Sequelize.fn("LTRIM", db.Sequelize.col("NIK")),
                  ),
                  " ",
                  "",
                ),
                "-",
                "",
              ),
              ".",
              "",
            ),
            normalizedNikDigits,
          ),
        });
      }
      if (!hrUser && normalizedNik && HRGAConnection) {
        const rows = await HRGAConnection.query(
          `
              SELECT TOP 1 NIK, NAMA, DEPT
              FROM [USER]
              WHERE LTRIM(RTRIM(NIK)) = :normalizedNik
                 OR REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(NIK)), ' ', ''), '-', ''), '.', '') = :normalizedNikDigits
                 OR RIGHT(REPLICATE('0', 16) + REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(NIK)), ' ', ''), '-', ''), '.', ''), 16)
                    = RIGHT(REPLICATE('0', 16) + :normalizedNikDigits, 16)
            `,
          {
            replacements: { normalizedNik, normalizedNikDigits },
            type: QueryTypes.SELECT,
          },
        );
        if (Array.isArray(rows) && rows.length > 0) {
          hrUser = rows[0];
        }
      }
      if (hrUser) {
        hrgaEmployeeFound = true;
        employeeInfo = {
          DEPT: hrUser.DEPT || "",
          NAMA: hrUser.NAMA || "",
          DIVISI: hrUser.DIVISI || "",
        };
        assetDebugLog("HRGA lookup success", { nik, dept: employeeInfo.DEPT });
      } else {
        assetDebugLog("HRGA lookup - user not found", { nik });
      }
    } catch (err) {
      assetDebugLog("HRGA lookup error", { nik, error: err.message });
      console.error("HRGA Error:", err.message);
    }
  }

  // Priority 2: Fallback ITItemAttribute (SEKARANG SAFE - attributes sudah defined)
  const deptAttr = attributes.find((attr) =>
    ["dept", "department", "DEPT", "Departemen"].includes(
      attr.attr_name?.toLowerCase(),
    ),
  );
  if (deptAttr && !employeeInfo.DEPT) {
    deptFromAttr = deptAttr.attr_value || "";
    assetDebugLog("DEPT fallback from attribute", {
      attr_name: deptAttr.attr_name,
      attr_value: deptFromAttr,
    });
  }

  const finalDept = employeeInfo.DEPT || deptFromAttr || "";
  assetDebugLog("Final DEPT resolution", {
    nik,
    hrga_dept: employeeInfo.DEPT,
    attr_dept: deptFromAttr,
    final_dept: finalDept,
  });

  const vendorName = "";
  const locationName = "";
  const serialNumber = "";
  const purchaseDate = null;
  const warrantyExpiry = null;
  let purchasePrice = null;

  // Process attributes (moved UP - now consistent with early usage)
  const attrList = attributes.map((a) => ({
    attr_name: a.attr_name,
    attr_value: a.attr_value,
  }));

  // Get 'nama' from attributes
  const namaAttr = attrList.find((a) => a.attr_name === "nama");
  const namaFromAttr = namaAttr?.attr_value || "";

  // Process softwares
  const softwares = item.softwares || [];
  const activeSoftwares = softwares.filter((s) => s.is_active);
  const softwareList = activeSoftwares.map((s) => ({
    software_name: s.software_name,
    version: s.version,
    installed_at: s.installed_at,
  }));

  const documents = (item.documents || []).map((doc) => {
    const relativePath = String(doc.file_path || "").replace(/\\/g, "/");
    return {
      document_id: doc.document_id,
      original_name: doc.file_name || null, // Menggunakan field 'file_name' dari model AssetDocument
      stored_name: doc.file_path || null, // Menggunakan field 'file_path' dari model AssetDocument
      mime_type: doc.mime_type,
      file_size: doc.file_size,
      file_path: relativePath,
      file_url: relativePath ? `/uploads/${relativePath}` : null,
      uploaded_by_nik: doc.uploaded_by || null,
      uploaded_by_name: null,
      uploaded_at: doc.uploaded_at || null,
    };
  });

  // Process status history - get latest
  const latestStatus = getLatestStatus(item.statusHistory || []);

  // Get all IP addresses from networks
  const ipAddresses = (item.networks || [])
    .filter((n) => n.ip_address)
    .map((n) => n.ip_address)
    .join(", ");

  const macAddresses = (item.networks || [])
    .filter((n) => n.mac_address)
    .map((n) => n.mac_address)
    .join(", ");

  // Determine type from various sources
  const getTypeValue = () => {
    if (subCategory?.sub_category_name) return subCategory.sub_category_name;
    if (categoryFromSub?.asset_type) return categoryFromSub.asset_type;
    if (categoryDirect?.asset_type) return categoryDirect.asset_type;
    if (categoryFromSub?.category_name) return categoryFromSub.category_name;
    if (categoryDirect?.category_name) return categoryDirect.category_name;
    return "Unknown";
  };

  // Determine category value
  const getCategoryValue = () => {
    if (categoryFromSub?.category_name) return categoryFromSub.category_name;
    if (categoryDirect?.category_name) return categoryDirect.category_name;
    return "Unknown";
  };

  // Determine asset group - prioritize direct asset_group_id, then fall back to category
  const getAssetGroupValue = () => {
    // First priority: direct asset_group_id from ITItem via assetGroup relation
    if (item.asset_group_id && item.assetGroup?.asset_group_name) {
      return String(item.assetGroup.asset_group_name).trim();
    }

    // Second priority: direct asset_group_id with fallback to query ITAssetGroup directly
    if (item.asset_group_id) {
      // Try to get from category's asset_group field
      if (categoryFromSub?.asset_group)
        return String(categoryFromSub.asset_group).trim();
      if (categoryDirect?.asset_group)
        return String(categoryDirect.asset_group).trim();
    }

    // Third priority: from category relationship
    if (categoryFromSub?.asset_group)
      return String(categoryFromSub.asset_group).trim();
    if (categoryDirect?.asset_group)
      return String(categoryDirect.asset_group).trim();

    return "";
  };

  // ========== NEW: Enhanced hierarchy resolution ==========
  const resolveHierarchyIds = async () => {
    let resolvedAssetMainTypeId = item.asset_main_type_id;
    let resolvedCategoryId = item.category_id;

    // Priority 1: Direct from ITItem columns
    if (item.asset_main_type_id) {
      resolvedAssetMainTypeId = item.asset_main_type_id;
    }

    if (item.category_id) {
      resolvedCategoryId = item.category_id;
    }

    // Priority 2: From subCategory → category
    if (!resolvedAssetMainTypeId && subCategory && categoryFromSub) {
      resolvedAssetMainTypeId = categoryFromSub.asset_main_type_id;
      if (!resolvedCategoryId) {
        resolvedCategoryId = categoryFromSub.it_category_id;
      }
    }

    // Priority 3: From directCategory
    if (!resolvedAssetMainTypeId && categoryDirect) {
      resolvedAssetMainTypeId = categoryDirect.asset_main_type_id;
    }
    if (!resolvedCategoryId && categoryDirect) {
      resolvedCategoryId = categoryDirect.it_category_id;
    }

    // Priority 4: Fallback query via sub_category_id if still null
    if (!resolvedCategoryId && item.sub_category_id) {
      const subCat = await db.ITSubCategory.findByPk(item.sub_category_id, {
        include: [
          {
            model: db.ITCategory,
            as: "category",
            required: false,
          },
        ],
      });
      if (subCat?.category) {
        resolvedCategoryId = subCat.category.it_category_id;
        resolvedAssetMainTypeId =
          subCat.category.asset_main_type_id || resolvedAssetMainTypeId;
      }
    }

    // Priority 5: Fallback query via category_id if still null
    if (!resolvedAssetMainTypeId && resolvedCategoryId) {
      const cat = await db.ITCategory.findByPk(resolvedCategoryId);
      if (cat) {
        resolvedAssetMainTypeId = cat.asset_main_type_id;
      }
    }

    console.log("[DEBUG] Hierarchy resolution:", {
      raw_item_main_type: item.asset_main_type_id,
      raw_item_category: item.category_id,
      subcat_category_id: categoryFromSub?.it_category_id,
      direct_category_id: categoryDirect?.it_category_id,
      final_main_type_id: resolvedAssetMainTypeId,
      final_category_id: resolvedCategoryId,
    });

    return { resolvedAssetMainTypeId, resolvedCategoryId };
  };

  const hierarchy = await resolveHierarchyIds();
  const purchasePriceActual =
    item.purchase_price_actual ?? purchasePrice ?? null;
  const purchasePricePlan = item.purchase_price_plan ?? null;
  const purchasePriceValue = purchasePriceActual ?? purchasePricePlan;

  return {
    // Basic Info
    id: item.it_item_id,
    noAsset: item.asset_tag || item.accounting_asset_no || item.it_item_id,
    it_item_id: item.it_item_id,
    asset_tag: item.asset_tag,
    accounting_asset_no: item.accounting_asset_no,

    // Type & Category
    type: getTypeValue(),
    category: getCategoryValue(),
    asset_main_type_id: hierarchy.resolvedAssetMainTypeId,
    classification: "",
    assetGroup: getAssetGroupValue(),
    asset_group_name: item.assetGroup?.asset_group_name || "",

    // Divisi & Department - Enhanced dengan fallback
    divisi: employeeInfo.DIVISI || "",
    dept: finalDept,
    department: finalDept,

    // Employee Info - prioritize nama from attributes, fallback to employee
    nama: namaFromAttr || "",
    assigned_to: namaFromAttr || employeeInfo.NAMA || "",
    nama_from_attr: namaFromAttr || "",
    nama_from_employee: employeeInfo.NAMA || "",
    nik: nik,
    assigned_to: namaFromAttr || employeeInfo.NAMA || "",
    nama_from_attr: namaFromAttr || "",
    nama_from_employee: employeeInfo.NAMA || "",
    // DEBUG: Asset nama sources (remove after fix confirmed)
    debug_assignment_info: {
      assetNo,
      it_item_id: item.it_item_id,
      searched_nik: nik,
      hasActiveAssignment: !!latestAssignment,
      latestAssignmentNik: nik,
      hrgaEmployeeFound,
      hrgaDept: employeeInfo.DEPT,
      attrDeptFound: !!deptFromAttr,
      finalDept: finalDept,
      assignmentsCount: item.assignments?.length || 0,
    },

    // Network
    hostname: primaryNetwork?.hostname || "",
    ip_address: ipAddresses,
    mac_address: macAddresses,
    mainIpAdress: primaryNetwork?.ip_address || "",
    backupIpAdress: secondaryNetwork?.ip_address || "",

    // Year & Dates
    tahunBeli: item.po_date_period
      ? String(item.po_date_period).slice(0, 4)
      : null,
    purchase_date: purchaseDate,
    warranty_expiry: warrantyExpiry,
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,

    // Financial
    purchase_price_actual: purchasePriceActual,
    purchase_price_plan: purchasePricePlan,
    purchase_price: purchasePriceValue,
    harga: purchasePriceValue,

    // Status
    status: item.current_status || "Active",
    current_status: item.current_status,
    acquisition_status: item.acquisition_status,
    is_disposed: item.is_disposed,
    status_history: latestStatus?.status || null,
    status_changed_at: latestStatus?.changed_at || null,

    // Additional Info
    vendor: vendorName,
    location: locationName,
    serial_number: serialNumber || "",
    description: "",
    keterangan: "",

    // IDs for reference
    sub_category_id: item.sub_category_id,
    category_id: hierarchy.resolvedCategoryId,
    classification_id: item.classification_id,
    asset_group_id: item.asset_group_id,
    asset_main_type_id: item.asset_main_type_id,
    asset_id: item.asset_id,

    // Additional IT-specific fields
    po_date_period: item.po_date_period,
    inspection_date_period: item.inspection_date_period,
    depreciation_end_date: item.depreciation_end_date,
    disposal_plan_date: item.disposal_plan_date,
    extend_warranty_date: item.extend_warranty_date,
    invoice_number: item.invoice_number,
    po_number: item.po_number,
    no_cip: item.no_cip,
    useful_life_year: item.useful_life_year,
    line_code: item.line_code,

    // Financial fields
    purchase_price_plan: item.purchase_price_plan,
    purchase_price_actual: item.purchase_price_actual,
    at_cost_value: item.at_cost_value,
    initial_depreciation: item.initial_depreciation,
    is_disposed: item.is_disposed,

    // Attributes
    attributes: attrList,

    // Softwares
    softwares: softwareList,

    // Documents
    documents,
  };
};

// Legacy compatibility - keep old function names
export const getListSql = () => null;
export const getDetailSql = () => null;
