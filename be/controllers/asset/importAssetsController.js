import xlsx from "xlsx";
import crypto from "crypto";
import winston from "winston";
import { db, sequelize } from "../../models/index.js";
import { Op } from "sequelize";
import { resolveClassificationId, resolveSubCategoryId } from "./shared.js";

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

const debugLog = (message) => {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEBUG_IMPORT === "true"
  ) {
    logger.debug(message);
  }
};

const parseYear = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4}$/.test(str)) {
    return str;
  }
  const match = str.match(/\d{4}/);
  if (match) return match[0];
  const num = parseInt(value);
  if (num && num > 1900 && num < 2100) {
    return String(num);
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

const findExistingAsset = async (noAsset) => {
  return await db.ITItem.findOne({
    where: {
      [Op.or]: [{ asset_tag: noAsset }, { accounting_asset_no: noAsset }],
    },
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
    const now = new Date();

    // Close all active assignments for this item with different NIK
    const [closedCount] = await ITItemAssignment.update(
      { returned_at: now },
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
    });
    debugLog(
      `[DEBUG][ASSIGN] activeSameNik count=${activeSameNik ? 1 : 0} itemId=${itemId} nik=${nik}`,
    );

    if (!activeSameNik) {
      await ITItemAssignment.create(
        {
          nik: nik,
          assigned_at: now,
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
    const now = new Date();

    // Try to update existing primary network
    const [updatedCount] = await ITItemNetwork.update(
      { hostname: hostname, updated_at: now },
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
          is_primary: true,
          updated_at: now,
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

const createNewAsset = async (asset, notFoundCategories, transaction) => {
  const noAsset = (asset.noAsset || "").trim();
  const status = asset.status || "Active";
  const tahunBeli = asset.tahunBeli
    ? String(asset.tahunBeli).slice(0, 4)
    : null;
  const period = tahunBeli ? `${tahunBeli}01` : null;

  const { subCategoryId, categoryId } = await getSubCategoryIdByType(
    asset,
    notFoundCategories,
  );
  const classificationId = await getClassificationIdByAsset(asset);

  debugLog(
    `[DEBUG] createNewAsset - noAsset: ${noAsset}, subCategoryId: ${subCategoryId}, categoryId: ${categoryId}, classificationId: ${classificationId}`,
  );

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
      asset_main_type_id: asset.asset_main_type_id
        ? Number(asset.asset_main_type_id)
        : null,
    },
    { transaction },
  );

  await upsertItemAssignment(newItem.it_item_id, asset, transaction);
  await upsertItemNetwork(newItem.it_item_id, asset, transaction);

  return { success: true, noAsset, it_item_id: newItem.it_item_id };
};

const updateExistingAsset = async (itItemId, asset, transaction) => {
  const status = asset.status || "Active";
  const tahunBeli = asset.tahunBeli
    ? String(asset.tahunBeli).slice(0, 4)
    : null;
  const period = tahunBeli ? `${tahunBeli}01` : null;

  await db.ITItem.update(
    {
      current_status: status,
      po_date_period: period,
      inspection_date_period: period,
      po_number: asset.noPO || null,
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

  return { success: true };
};

export const importAssets = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const assets = req.body;

    debugLog("[DEBUG] importAssets called, total:", assets?.length);

    if (!Array.isArray(assets) || assets.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Data array kosong." });
    }

    const results = {
      total: assets.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      notFoundCategories: [],
    };

    for (let i = 0; i < assets.length; i++) {
      try {
        const asset = assets[i];
        const noAsset = (asset.noAsset || asset?.["NO.ASSET"] || "").trim();
        const nik = extractNik(asset);
        const hostname = extractHostname(asset);
        debugLog(
          `[DEBUG][IMPORT API] row=${i + 1} noAsset=${noAsset || "-"} nik="${nik}" hostname="${hostname}"`,
        );

        if (!noAsset) {
          results.failed++;
          results.errors.push({ row: i + 1, error: "Nomor Asset wajib diisi" });
          continue;
        }

        const existing = await findExistingAsset(noAsset);

        if (existing) {
          await updateExistingAsset(existing.it_item_id, asset, transaction);
          results.updated++;
        } else {
          await createNewAsset(asset, results.notFoundCategories, transaction);
          results.created++;
        }
      } catch (rowError) {
        results.failed++;
        results.errors.push({ row: i + 1, error: rowError.message });

        await transaction.rollback();
        logger.error(
          `[DEBUG] Import API error at row ${i + 1}:`,
          rowError.message,
        );
        return res.status(200).json({
          message: `Import berhenti di row ${i + 1} karena error: ${rowError.message}`,
          results,
        });
      }
    }

    await transaction.commit();
    return res.status(200).json({
      message: `Import selesai. Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`,
      results,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: `Gagal import: ${error.message}` });
  }
};

export const importAssetsFromExcel = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.file) {
      await transaction.rollback();
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

      const dataRows = rawData.slice(4);
      results.total += dataRows.length;
      debugLog(`[DEBUG] Sheet "${sheetName}" total rows: ${dataRows.length}`);

      for (let i = 0; i < dataRows.length; i++) {
        const rowNum = i + 5;
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

          const asset = {
            noAsset: noAsset,
            type: typeValue,
            sheetName: sheetName,
            status: String(row[24] || row[13] || "Active").trim(),
            tahunBeli: parseYear(row[10]),
            noPO: String(row[21] || "").trim(),
            nik: String(row[6] || row[22] || row[23] || "").trim(),
            hostname: String(row[9] || row[24] || row[25] || "").trim(),
          };
          debugLog(
            `[DEBUG][IMPORT EXCEL] sheet=${sheetName} row=${rowNum} noAsset=${asset.noAsset || "-"} nik="${asset.nik}" hostname="${asset.hostname}"`,
          );

          const existing = await findExistingAsset(noAsset);

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

          await transaction.rollback();
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
    await transaction.rollback();
    logger.error("[DEBUG] Import Excel error:", error.message);
    return res.status(500).json({ message: `Gagal import: ${error.message}` });
  }
};
