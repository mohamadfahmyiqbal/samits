import xlsx from "xlsx";
import crypto from "crypto";
import winston from "winston";
import { db, sequelize } from "../../../models/index.js";
import { Op } from "sequelize";
import { resolveClassificationId, resolveSubCategoryId } from "../shared.js";

// Setup logger for import operations
const logger = winston.createLogger({
 level: process.env.NODE_ENV === "production" ? "error" : "debug",
 format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
 ),
 transports: [new winston.transports.File({ filename: "logs/import.log" })],
});

if (process.env.NODE_ENV !== "production") {
 logger.add(
  new winston.transports.Console({
   format: winston.format.simple(),
  }),
 );
}

const parseExcelDate = (value) => {
 if (!value) return null;

 // Excel serial number
 if (typeof value === "number") {
  const parsed = xlsx.SSF.parse_date_code(value);
  if (!parsed) return null;

  return new Date(parsed.y, parsed.m - 1, parsed.d);
 }

 // string date (yyyy-mm-dd, dll)
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? null : date;
};

const debugLog = (message) => {
 if (
  process.env.NODE_ENV !== "production" &&
  process.env.DEBUG_IMPORT === "true"
 ) {
  logger.debug(message);
 }
};

const safeRollback = async (transaction, context = "unknown") => {
 if (!transaction) return;
 if (typeof transaction.finished === "string") {
  logger.debug(`[DEBUG] Safe rollback skipped (${context}) because transaction already finished=${transaction.finished}`);
  return;
 }

 try {
  await transaction.rollback();
  logger.debug(`[DEBUG] Transaction rolled back (${context}).`);
 } catch (rollbackError) {
  logger.error(
   `[DEBUG] Failed to rollback transaction (${context}): ${rollbackError.message}`,
  );
 }
};

const parseYear = (value) => {
 if (value === null || value === undefined || value === "") {
  return null;
 }

 // Excel serial date number
 if (typeof value === "number" && value > 30000) {
  const excelDate = xlsx.SSF.parse_date_code(value);
  if (excelDate?.y) {
   return String(excelDate.y);
  }
 }

 const str = String(value).trim();

 // already 4-digit year
 if (/^\d{4}$/.test(str)) {
  return str;
 }

 const match4 = str.match(/\b(19|20)\d{2}\b/);
 if (match4) {
  return match4[0];
 }

 const date = new Date(str);
 if (!Number.isNaN(date.getTime())) {
  return String(date.getFullYear());
 }

 return null;
};


const getSubCategoryIdByType = async (asset, notFoundCategories = []) => {
 try {
  const typeName = String(asset?.type || "")
   .replace(/\u00A0/g, " ")
   .replace(/\s+/g, " ")
   .trim();
  if (!typeName) {
   throw new Error("Type kosong, tidak bisa menentukan sub kategori.");
  }

  let subCategoryId = null;
  let categoryId = null;

  try {
   subCategoryId = await resolveSubCategoryId({ type: typeName }, null);
   const subCategory = await db.ITSubCategory.findOne({
    where: { sub_category_id: subCategoryId },
   });
   categoryId = subCategory?.it_category_id || null;
  } catch (_primaryError) {
   // fallback below
  }

  if (!subCategoryId || !categoryId) {
   const subCategoryDirect = await db.ITSubCategory.findOne({
    where: {
     [Op.or]: [
      { sub_category_name: { [Op.like]: typeName } },
      { sub_category_name: { [Op.like]: `%${typeName}%` } },
     ],
    },
    order: [["sub_category_id", "ASC"]],
   });

   if (
    subCategoryDirect?.sub_category_id &&
    subCategoryDirect?.it_category_id
   ) {
    subCategoryId = subCategoryDirect.sub_category_id;
    categoryId = subCategoryDirect.it_category_id;
   }
  }

  if (!subCategoryId || !categoryId) {
   const fromCategory = await db.ITCategory.findOne({
    where: {
     [Op.or]: [
      { asset_type: { [Op.like]: typeName } },
      { category_name: { [Op.like]: typeName } },
     ],
    },
    include: [
     {
      model: db.ITSubCategory,
      as: "subCategories",
      required: false,
     },
    ],
    order: [
     [
      { model: db.ITSubCategory, as: "subCategories" },
      "sub_category_id",
      "ASC",
     ],
    ],
   });

   const fallbackSubCategoryId =
    fromCategory?.subCategories?.[0]?.sub_category_id || null;
   if (fromCategory?.it_category_id && fallbackSubCategoryId) {
    subCategoryId = fallbackSubCategoryId;
    categoryId = fromCategory.it_category_id;
   }
  }

  if (!subCategoryId || !categoryId) {
   const assetGroup = await db.ITAssetGroup.findOne({
    where: sequelize.where(
     sequelize.fn(
      "LOWER",
      sequelize.fn(
       "LTRIM",
       sequelize.fn("RTRIM", sequelize.col("asset_group_name"))
      )
     ),
     typeName.toLowerCase()
    ),
    order: [["asset_group_id", "ASC"]],
   });

   if (assetGroup?.sub_category_id) {
    const subCategory = await db.ITSubCategory.findOne({
     where: {
      sub_category_id: assetGroup.sub_category_id,
     },
    });

    if (subCategory) {
     subCategoryId = subCategory.sub_category_id;
     categoryId = subCategory.it_category_id;
    }
   }
  }

  if (!subCategoryId || !categoryId) {
   throw new Error(`Category untuk type "${typeName}" tidak ditemukan.`);
  }

  debugLog(
   `[DEBUG] Found: ${subCategoryId} for "${typeName}", category_id: ${categoryId}`,
  );
  return { subCategoryId, categoryId };
 } catch (error) {
  const typeName = String(asset?.type || "").trim();
  if (typeName && !notFoundCategories.includes(typeName)) {
   notFoundCategories.push(typeName);
   debugLog(`[DEBUG] NOT FOUND: "${typeName}"`);
  }
  throw error;
 }
};

const findExistingAsset = async (noAsset, transaction) => {
 return db.ITItem.findOne({
  where: {
   [Op.or]: [
    { asset_tag: noAsset },
    { accounting_asset_no: noAsset }
   ]
  },
  transaction
 });
};

const extractNik = (asset = {}) => {
 const nik = String(
  asset.nik ||
  asset.NIK ||
  asset["NIK"] ||
  asset.employeeNik ||
  asset["EMPLOYEE_NIK"] ||
  asset["EMPLOYEE NIK"] ||
  asset.picNik ||
  "",
 ).trim();
 return nik;
};

const extractHostname = (asset = {}) => {
 const hostname = String(
  asset.hostname ||
  asset.HOSTNAME ||
  asset["HOSTNAME"] ||
  asset.hostName ||
  asset["Host Name"] ||
  "",
 ).trim();
 return hostname;
};

const upsertItemAssignment = async (itemId, asset, transaction) => {
 const noAsset = String(asset?.noAsset || asset?.["NO.ASSET"] || "").trim();
 try {
  const nik = extractNik(asset);
  debugLog(
   `[DEBUG][ASSIGN] asset=${noAsset || "-"} itemId=${itemId} nik="${nik}"`,
  );

  if (!itemId) {
   throw new Error("itemId kosong");
  }

  if (!nik) {
   debugLog(
    `[DEBUG][ASSIGN] skip insert assignment because nik is empty for asset=${noAsset || "-"}`,
   );
   return;
  }

  const ITItemAssignment = db.ITItemAssignment;
  const nowLiteral = sequelize.literal("GETDATE()");

  // Close all active assignments for this item with different NIK
  const [closedCount] = await ITItemAssignment.update(
   { returned_at: nowLiteral },
   {
    where: {
     it_item_id: itemId,
     returned_at: null,
     nik: { [Op.ne]: nik },
    },
    transaction,
   },
  );
  debugLog(
   `[DEBUG][ASSIGN] closed previous active assignments count=${closedCount} itemId=${itemId} nik=${nik}`,
  );

  // Check if there's already an active assignment with the same NIK
  const activeSameNik = await ITItemAssignment.findOne({
   where: {
    it_item_id: itemId,
    nik: nik,
    returned_at: null,
   },
   transaction,
  });
  debugLog(
   `[DEBUG][ASSIGN] activeSameNik count=${activeSameNik ? 1 : 0} itemId=${itemId} nik=${nik}`,
  );

  if (!activeSameNik) {
   await ITItemAssignment.create(
    {
     nik: nik,
     assigned_at: nowLiteral,
     it_item_id: itemId,
    },
    { transaction },
   );
   debugLog(
    `[DEBUG][ASSIGN] inserted new assignment itemId=${itemId} nik=${nik}`,
   );
  } else {
   debugLog(
    `[DEBUG][ASSIGN] skip insert because active assignment already exists itemId=${itemId} nik=${nik}`,
   );
  }
 } catch (error) {
  logger.error(
   `[DEBUG][ASSIGN] abnormal for asset=${noAsset || "-"} itemId=${itemId}: ${error.message}`,
  );
  throw new Error(`Abnormal it_item_assignments: ${error.message}`);
 }
};

const upsertItemNetwork = async (itemId, asset, transaction) => {
 const noAsset = String(asset?.noAsset || asset?.["NO.ASSET"] || "").trim();
 try {
  const hostname = extractHostname(asset);
  debugLog(
   `[DEBUG][NETWORK] asset=${noAsset || "-"} itemId=${itemId} hostname="${hostname}"`,
  );

  if (!itemId) {
   throw new Error("itemId kosong");
  }

  if (!hostname) {
   debugLog(
    `[DEBUG][NETWORK] skip upsert network because hostname is empty for asset=${noAsset || "-"}`,
   );
   return;
  }

  const ITItemNetwork = db.ITItemNetwork;
  const nowLiteral = sequelize.literal("GETDATE()");

  // Try to update existing primary network
  const [updatedCount] = await ITItemNetwork.update(
   { hostname: hostname, ip_address: asset.ipMain || null, updated_at: nowLiteral },
   {
    where: {
     it_item_id: itemId,
     is_primary: true,
    },
    transaction,
   },
  );

  debugLog(
   `[DEBUG][NETWORK] primary network updated count=${updatedCount} itemId=${itemId}`,
  );

  if (!updatedCount) {
   await ITItemNetwork.create(
    {
     it_item_id: itemId,
     hostname: hostname,
     ip_address: asset.ipMain || null,
     is_primary: true,
     updated_at: nowLiteral,
    },
    { transaction },
   );
   debugLog(
    `[DEBUG][NETWORK] inserted primary network itemId=${itemId} hostname="${hostname}"`,
   );
  }
 } catch (error) {
  logger.error(
   `[DEBUG][NETWORK] abnormal for asset=${noAsset || "-"} itemId=${itemId}: ${error.message}`,
  );
  throw new Error(`Abnormal it_item_networks: ${error.message}`);
 }
};

let cachedClassificationId = null;
const classificationCache = new Map();
const normalizeLookupText = (value) =>
 String(value || "")
  .replace(/\u00A0/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const getClassificationId = async () => {
 if (cachedClassificationId) return cachedClassificationId;
 cachedClassificationId = await resolveClassificationId(null);
 return cachedClassificationId;
};
const getClassificationIdByAsset = async (asset) => {
 const ITClassification = db.ITClassification;
 const candidates = [
  asset?.classification,
  asset?.classificationName,
  asset?.sheetName,
  asset?.type,
 ];

 for (const candidate of candidates) {
  const normalized = normalizeLookupText(candidate);
  if (!normalized) continue;

  if (classificationCache.has(normalized)) {
   return classificationCache.get(normalized);
  }

  const classification = await ITClassification.findOne({
   where: sequelize.where(
    sequelize.fn(
     "LOWER",
     sequelize.fn(
      "LTRIM",
      sequelize.fn("RTRIM", sequelize.col("classification_name")),
     ),
    ),
    normalized,
   ),
   order: [["classification_id", "ASC"]],
  });

  if (classification) {
   classificationCache.set(normalized, classification.classification_id);
   return classification.classification_id;
  }
 }

 return await getClassificationId();
};

const upsertItemAttributes = async (itemId, asset, transaction) => {
 const attributes = [
  { attr_name: "division", attr_value: asset.division },
  { attr_name: "department", attr_value: asset.department },
  { attr_name: "user_name", attr_value: asset.userName },
  { attr_name: "ip_backup", attr_value: asset.ipBackup },
  {
   attr_name: "depreciation_date",
   attr_value: asset.depreciationDate
    ? asset.depreciationDate.toISOString().slice(0, 10)
    : null,
  },
 ].filter((x) => x.attr_value);
 for (const attr of attributes) {
  const existing = await db.ITItemAttribute.findOne({
   where: {
    it_item_id: itemId,
    attr_name: attr.attr_name,
   },
   transaction,
  });
  if (existing) {
   await db.ITItemAttribute.update(
    { attr_value: attr.attr_value },
    {
     where: {
      it_item_id: itemId,
      attr_name: attr.attr_name,
     },
     transaction,
    }
   );
  } else {
   await db.ITItemAttribute.create(
    {
     it_item_id: itemId,
     attr_name: attr.attr_name,
     attr_value: attr.attr_value,
    },
    { transaction }
   );
  }
 }
};

const createNewAsset = async (asset, notFoundCategories, transaction) => {
 const noAsset = (asset.noAsset || "").trim();
 const status = asset.status || "Active";
 const tahunBeli =
  asset.tahunBeli !== null &&
   asset.tahunBeli !== undefined &&
   String(asset.tahunBeli).trim() !== ""
   ? String(asset.tahunBeli).trim().slice(0, 4)
   : null;

 const period =
  tahunBeli && /^\d{4}$/.test(tahunBeli)
   ? `${tahunBeli}01`
   : null;

 const { subCategoryId, categoryId } = await getSubCategoryIdByType(
  asset,
  notFoundCategories,
 );
 const classificationId = await getClassificationIdByAsset(asset);
 console.log(classificationId);

 debugLog(
  `[DEBUG] classificationId: ${classificationId}`,
 );
 debugLog(
  `[DEBUG] createNewAsset - noAsset: ${noAsset}, subCategoryId: ${subCategoryId}, categoryId: ${categoryId}, classificationId: ${classificationId}`,
 );

 debugLog(classificationId)
 const newItem = await db.ITItem.create(
  {
   it_item_id: crypto.randomUUID(),
   sub_category_id: subCategoryId,
   category_id: categoryId,
   classification_id: classificationId,
   asset_tag: noAsset,
   current_status: status,
   po_date_period: period,
   inspection_date_period: period,
   acquisition_status: "Acquired",
   is_disposed: false,
   po_number: asset.noPO || null,
   disposal_plan_date: asset.disposalPlanDate || null,
   asset_main_type_id: asset.asset_main_type_id
    ? Number(asset.asset_main_type_id)
    : null,
  },
  { transaction },
 );

 await upsertItemAssignment(newItem.it_item_id, asset, transaction);
 await upsertItemNetwork(newItem.it_item_id, asset, transaction);
 await upsertItemAttributes(newItem.it_item_id, asset, transaction);
 return { success: true, noAsset, it_item_id: newItem.it_item_id };
};

const updateExistingAsset = async (itItemId, asset, transaction) => {
 const status = asset.status || "Active";
 const tahunBeli =
  asset.tahunBeli !== null &&
   asset.tahunBeli !== undefined &&
   String(asset.tahunBeli).trim() !== ""
   ? String(asset.tahunBeli).trim().slice(0, 4)
   : null;

 const period =
  tahunBeli && /^\d{4}$/.test(tahunBeli)
   ? `${tahunBeli}01`
   : null;

 await db.ITItem.update(
  {
   current_status: status,
   po_date_period: period,
   inspection_date_period: period,
   po_number: asset.noPO || null,
   disposal_plan_date: asset.disposalPlanDate || null,
   asset_main_type_id: asset.asset_main_type_id
    ? Number(asset.asset_main_type_id)
    : null,
  },
  {
   where: { it_item_id: itItemId },
   transaction,
  },
 );

 await upsertItemAssignment(itItemId, asset, transaction);
 await upsertItemNetwork(itItemId, asset, transaction);
 await upsertItemAttributes(itItemId, asset, transaction);

 return { success: true };
};


export const importAssetsFromExcel = async (req, res) => {
 const transaction = await sequelize.transaction();
 try {
  if (!req.file) {
   await safeRollback(transaction, "importAssetsFromExcel-missing-file");
   return res.status(400).json({ message: "File Excel wajib diupload." });
  }

  const rawBody = req.body || {};
  const normalizedBody = Object.fromEntries(
   Object.entries(rawBody).map(([k, v]) => [String(k).trim(), v]),
  );
  const requestedSheetNames = String(normalizedBody.sheetNames || "")
   .split(",")
   .map((name) => name.trim())
   .filter(Boolean);
  const debugFlag = String(normalizedBody.debug || "").trim() === "1";

  debugLog("[DEBUG] Reading workbook");
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const selectedSheetNames = requestedSheetNames.length
   ? workbook.SheetNames.filter((name) => requestedSheetNames.includes(name))
   : [workbook.SheetNames[0]];

  if (selectedSheetNames.length === 0) {
   return res.status(400).json({
    message: "Sheet yang diminta tidak ditemukan di file.",
    availableSheets: workbook.SheetNames,
   });
  }

  if (debugFlag) {
   logger.debug("[DEBUG] Body:", normalizedBody);
   logger.debug("[DEBUG] Selected sheets:", selectedSheetNames);
  }

  const results = {
   total: 0,
   created: 0,
   updated: 0,
   failed: 0,
   errors: [],
   notFoundCategories: [],
  };

  for (const sheetName of selectedSheetNames) {
   const worksheet = workbook.Sheets[sheetName];
   const rawData = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
   });

   if (!rawData || rawData.length < 5) {
    if (debugFlag) {
     logger.debug(
      `[DEBUG] Skip sheet "${sheetName}" karena format tidak valid`,
     );
    }
    continue;
   }

   const dataRows = rawData.slice(6);
   results.total += dataRows.length;
   debugLog(`[DEBUG] Sheet "${sheetName}" total rows: ${dataRows.length}`);

   for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 7;
    try {
     const row = dataRows[i];
     const noAsset = String(row[1] || "").trim();
     const typeValue = String(row[2] || "").trim();
     const normalizedNoAsset = noAsset.toUpperCase();
     const normalizedType = typeValue.toUpperCase();

     if (debugFlag) {
      debugLog(
       `[DEBUG] Sheet "${sheetName}" Row ${rowNum} - noAsset: "${noAsset}", type: "${typeValue}"`,
      );
     }

     // Skip repeated header/title rows inside sheet data.
     if (
      normalizedNoAsset === "NO.ASSET" ||
      normalizedNoAsset === "NO ASSET" ||
      normalizedType === "TYPE"
     ) {
      continue;
     }

     if (!typeValue) {
      continue;
     }

     const mainTypeMap = {
      PC: 2,
      CCTV: 2,
      CLIENT: 2,
      UTAMA: 1,
     };

     // console.log({
     //  "it_items": {
     //   "noAsset": row[1],
     //   "noPO": row[15],
     //   "classification_id": null,
     //   "depreciationEndDate": parseExcelDate(row[8]),
     //   "disposalPlanDate": parseExcelDate(row[8]),
     //   "extend_warranty_date": null,
     //   "it_item_id": null,
     //   "sub_category_id": null,
     //   "request_id": null,
     //   "current_status": row[12] || null,
     //   "purchase_price_plan": null,
     //   "purchase_price_actual": null,
     //   "poDatePeriod": parseExcelDate(row[7]),
     //   "ispection_date_period": parseExcelDate(row[7]),
     //   "no_cip": null,
     //   "invoice_number": null,
     //   "line_code": null,
     //   "at_cost_value": null,
     //   "useful_life_year": null,
     //   "initial_depreciation": null,
     //   "accounting_asset_no": null,
     //   "useful_life_year": null,
     //   "initial_depreciation": null,
     //   "accounting_asset_no": row[1],
     //   "acquisition_status": row[1],
     //   "is_disposed": null,
     //   "disposal_id_ref": null,
     //   "category_id": null,
     //   "asset_group_id": row[2],
     //   "asset_group_id": row[2],
     //   "asset_main_type_id": 2,
     //  },
     //  "it_item_assignments": {
     //   "id": null,
     //   "nik": row[6],
     //   "assigned_at": Date.now(),
     //   "returned_at": null,
     //   "it_item_id": null,
     //  },
     //  "it_item_networks": {
     //   "network_id": null,
     //   "it_item_id": "UUID",
     //   "hostname": row[10],
     //   "ip_address": row[11],
     //   "mac_address": null,
     //   "is_primary": 1,
     //  }, "it_item_attributes": {
     //   "id": null,
     //   "it_item_id": "UUID",
     //   "attr_name": row[5],
     //  }
     // });


     const asset = {
      noAsset: String(row[1] || "").trim(),
      noPO: String(row[15] || "").trim(),
      type: String(row[2] || "").trim(),
      division: String(row[3] || "").trim(),
      department: String(row[4] || "").trim(),
      userName: String(row[5] || "").trim(),
      nik: String(row[6] || "").trim(),
      tahunBeli: parseYear(row[7]),
      depreciationDate: parseExcelDate(row[8]),
      disposalPlanDate: parseExcelDate(row[8]),
      hostname: String(row[9] || "").trim(),
      ipMain: String(row[10] || "").trim(),
      ipBackup: String(row[11] || "").trim(),
      status: String(row[12] || "Active").trim(),
      supplier: String(row[13] || "").trim(),
      picSupplier: String(row[15] || "").trim(),
      kontakSupplier: String(row[16] || "").trim(),
      remarks: String(row[17] || "").trim(),
      sheetName,
      asset_main_type_id: mainTypeMap[sheetName.toUpperCase()] || 2,
     };
     debugLog(
      `[DEBUG][IMPORT EXCEL] sheet=${sheetName} row=${rowNum} noAsset=${asset.noAsset || "-"} nik="${asset.nik}" hostname="${asset.hostname}"`,
     );


     const existing = await findExistingAsset(noAsset, transaction);
     // console.log(asset);
     if (existing) {
      await updateExistingAsset(existing.it_item_id, asset, transaction);
      results.updated++;
     } else {
      await createNewAsset(
       asset,
       results.notFoundCategories,
       transaction,
      );
      results.created++;
     }
    } catch (rowError) {
     logger.error(
      `[DEBUG] Sheet "${sheetName}" Row ${rowNum} - ERROR:`,
      rowError.message,
     );
     results.failed++;
     results.errors.push({
      sheet: sheetName,
      row: rowNum,
      noAsset: String(dataRows[i]?.[1] || "").trim(),
      error: rowError.message,
     });

     await safeRollback(transaction, `importAssetsFromExcel-${sheetName}-${rowNum}`);
     return res.status(200).json({
      message: `Import berhenti di sheet ${sheetName} row ${rowNum} karena error: ${rowError.message}`,
      results,
     });
    }
   }
  }

  debugLog("[DEBUG] Import completed - results:", results);
  await transaction.commit();
  return res.status(200).json({
   message: `Import selesai. Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`,
   results,
  });
 } catch (error) {
  await safeRollback(transaction, "importAssetsFromExcel-exception");
  logger.error("[DEBUG] Import Excel error:", error.message);
  return res.status(500).json({ message: `Gagal import: ${error.message}` });
 }
};
