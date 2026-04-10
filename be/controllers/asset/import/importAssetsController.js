import xlsx from "xlsx";
import crypto from "crypto";
import moment from "moment";
import { db, sequelize } from "../../../models/index.js";
import { Op } from "sequelize";
import { resolveClassificationId, resolveSubCategoryId } from "../shared.js";
import { logger } from "./logger.js";
import { debugLog, normalizeLookupText, safeTrim } from "./helpers.js";
import { mapExcelRowToAsset } from "./excelMapper.js";
import { parseExcelDate, parseYear } from "./parsers.js";
import findExistingAsset from "./findExistingAsset.js";
import updateExistingAsset from "./updateExistingAsset.js";
import createNewAsset from "./createNewAsset.js";

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
   const classificationCache = new Map();

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

     const asset = mapExcelRowToAsset(row, sheetName);
     debugLog(
      `[DEBUG][IMPORT EXCEL] sheet=${sheetName} row=${rowNum} noAsset=${asset.noAsset || "-"} nik="${asset.nik}" hostname="${asset.hostname}"`,
     );
     const existing = await findExistingAsset(noAsset, transaction);
     const itemId = existing?.it_item_id || crypto.randomUUID(); const parsedDate = parseExcelDate(row[8]);

     const depreciationDate = parsedDate
      ? moment(parsedDate).format("YYYY-MM-DD")
      : null;

     const disposalDate = parsedDate
      ? moment(parsedDate).subtract(2, "months").format("YYYY-MM-DD")
      : null;

     const typeKey = String(row[2] || "").trim().toUpperCase();

     let classificationData = classificationCache.get(typeKey);

     if (!classificationData) {
      classificationData = await resolveClassificationId(typeKey, transaction);
      classificationCache.set(typeKey, classificationData);
     }

     const assets = {
      "it_items": {
       "asset_tag": asset.noAsset,
       "po_number": row[14] || null,
       "classification_id": classificationData?.sub_category_id === 46 ? 2 : 1,
       "depreciation_end_date": depreciationDate || null,
       "disposal_plan_date": disposalDate || null,
       "extend_warranty_date": null,
       "it_item_id": itemId,
       "sub_category_id": classificationData?.sub_category_id || null,
       "request_id": null,
       "current_status": row[12],
       "purchase_price_plan": null,
       "purchase_price_actual": null,
       "po_date_period": null,
       "inspection_date_period": null,
       "no_cip": null,
       "invoice_number": null,
       "acquisition_status": asset?.noAsset === "BELUM AKUISISI" ? "Waiting Acquisition" : "Acquired",
       "is_disposed": row[12] === "Disposed" ? 1 : 0,
       "category_id": classificationData?.it_category_id || null,
       "asset_group_id": classificationData?.asset_group_id || null,
       "asset_main_type_id": classificationData?.asset_main_type_id || null,
      },
      "it_item_assignments": {
       "nik": row[6] || null,
       "it_item_id": itemId,
      },
      "it_item_networks": {
       "it_item_id": itemId,
       "hostname": row[9] || null,
       "ip_address": row[10] || null,
      },
      "it_item_attributes": {
       "it_item_id": itemId,
       "attr_name": row[5] || null,
       "attr_value": row[5] || null,
      }
     }
     // console.log("assets", row[2]);
     if (existing) {
      await updateExistingAsset(assets, transaction);
      results.updated++;
     } else {
      await createNewAsset(
       assets,
       transaction
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

  console.log({
   updated: results.updated,
   created: results.created,
  });
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
}