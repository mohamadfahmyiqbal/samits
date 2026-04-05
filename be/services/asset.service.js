/* be/services/asset.service.js - Service Layer untuk Asset Management
 * Memisahkan business logic dari controllers
 * Production-ready, clean code, error handling
 * Compatible dengan existing controllers
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { db, sequelize } from "../models/index.js";
import {
  resolveCategoryId,
  resolveSubCategoryId,
  resolveClassificationId,
  loadAssetByNo,
} from "../controllers/asset/shared.js";

const ASSET_DOCUMENT_BASE_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "asset-documents",
);

export class AssetService {
  /**
   * Resolve category hierarchy dari payload
   */
  static async resolveCategoryHierarchy(assetData, transaction = null) {
    const subCategoryId = await resolveSubCategoryId(assetData, transaction);
    const categoryId = await resolveCategoryId(
      assetData,
      subCategoryId,
      transaction,
    );
    return { subCategoryId, categoryId };
  }

  /**
   * Buat ITItem record utama
   */
  static async createITItem(payload, itItemId, uploaderNik, transaction) {
    const {
      noAsset,
      status = "Active",
      tahunBeli,
      tahunDepreciation,
      asset_main_type_id,
      asset_group_id,
      // ... other fields
      ...itemData
    } = payload;

    // Parse tahunBeli → YYYY01
    let period = null;
    if (tahunBeli) {
      const date = new Date(tahunBeli);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        period = `${year}01`;
      }
    }

    const ITItem = db.ITItem;
    await ITItem.create(
      {
        it_item_id: itItemId,
        asset_tag: noAsset,
        current_status: status,
        po_date_period: period,
        inspection_date_period: period,
        acquisition_status: "Acquired",
        is_disposed: false,
        useful_life_year: parseInt(tahunDepreciation) || null,
        asset_main_type_id: asset_main_type_id
          ? Number(asset_main_type_id)
          : null,
        asset_group_id: asset_group_id ? Number(asset_group_id) : null,
        ...itemData,
      },
      { transaction },
    );
  }

  /**
   * Handle asset assignment berdasarkan NIK
   */
  static async handleAssetAssignment(itItemId, nik, transaction) {
    if (!nik?.trim()) return;

    const ITItemAssignment = db.ITItemAssignment;
    const getNowValue = () =>
      sequelize.getDialect() === "mssql"
        ? sequelize.literal("GETDATE()")
        : new Date();

    await ITItemAssignment.create(
      {
        nik: nik.trim(),
        assigned_at: getNowValue(),
        it_item_id: itItemId,
      },
      { transaction },
    );
  }

  static getNowValue() {
    return sequelize.getDialect() === "mssql"
      ? sequelize.literal("GETDATE()")
      : new Date();
  }

  static async upsertNetworkEntry(
    itItemId,
    { hostname, ipAddress, macAddress, isPrimary },
    transaction,
  ) {
    if (!itItemId || !ipAddress) return;

    const ITItemNetwork = db.ITItemNetwork;
    const nowValue = this.getNowValue();
    const data = {
      hostname: hostname?.trim() || null,
      ip_address: ipAddress.trim(),
      mac_address: macAddress?.trim() || null,
      updated_at: nowValue,
    };

    const [updated] = await ITItemNetwork.update(data, {
      where: { it_item_id: itItemId, is_primary: isPrimary ? 1 : 0 },
      transaction,
    });

    if (!updated) {
      await ITItemNetwork.create(
        {
          it_item_id: itItemId,
          ...data,
          is_primary: isPrimary ? 1 : 0,
        },
        { transaction },
      );
    }
  }

  /**
   * Buat/update network record
   */
  static async handleAssetNetwork(itItemId, hostname, transaction) {
    if (!hostname?.trim()) return;

    const ITItemNetwork = db.ITItemNetwork;
    const getNowValue = () => this.getNowValue();

    // Update atau create primary network
    const [updated] = await ITItemNetwork.update(
      { hostname: hostname.trim(), updated_at: getNowValue() },
      {
        where: { it_item_id: itItemId, is_primary: true },
        transaction,
      },
    );

    if (!updated) {
      await ITItemNetwork.create(
        {
          it_item_id: itItemId,
          hostname: hostname.trim(),
          is_primary: true,
          updated_at: getNowValue(),
        },
        { transaction },
      );
    }
  }

  /**
   * Simpan nama sebagai attribute
   */
  static async saveAssetName(itItemId, nama, transaction) {
    if (!nama?.trim()) return;

    const ITItemAttribute = db.ITItemAttribute;
    await ITItemAttribute.create(
      {
        attr_name: "nama",
        attr_value: nama.trim(),
        it_item_id: itItemId,
      },
      { transaction },
    );
  }

  /**
   * Buat status history
   */
  static async createStatusHistory(itItemId, status, transaction) {
    const ITItemStatusHistory = db.ITItemStatusHistory;
    const getNowValue = () =>
      sequelize.getDialect() === "mssql"
        ? sequelize.literal("GETDATE()")
        : new Date();

    await ITItemStatusHistory.create(
      {
        it_item_id: itItemId,
        status,
        changed_at: getNowValue(),
      },
      { transaction },
    );
  }

  /**
   * Buat audit log
   */
  static async createAuditLog(
    itItemId,
    assetNo,
    eventType,
    payload,
    req,
    uploaderNik,
    uploaderName,
    transaction,
  ) {
    const AssetAuditLog = db.AssetAuditLog;
    const getNowValue = () =>
      sequelize.getDialect() === "mssql"
        ? sequelize.literal("GETDATE()")
        : new Date();

    await AssetAuditLog.create(
      {
        it_item_id: itItemId,
        asset_no: assetNo,
        event_type: eventType,
        actor_nik: uploaderNik,
        actor_name: uploaderName,
        source_module: "AssetManagement",
        after_data: JSON.stringify(payload),
        event_at: getNowValue(),
        client_ip: req.ip || null,
        user_agent: req.get("User-Agent") || null,
      },
      { transaction },
    );
  }

  /**
   * Upload documents & create AssetDocument records
   */
  static async uploadAssetDocuments(itItemId, files, uploaderNik, transaction) {
    if (!files?.length) return [];

    const AssetDocument = db.AssetDocument;
    const destinationDir = path.join(ASSET_DOCUMENT_BASE_DIR, itItemId);
    await fs.mkdir(destinationDir, { recursive: true });

    const documentRows = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
      const safeName =
        file.originalname?.replace(/[^\w.\-() ]+/g, "_").trim() ||
        `doc-${Date.now()}.pdf`;
      const storedName = `${Date.now()}-${i + 1}-${crypto.randomUUID()}${ext}`;
      const absPath = path.join(destinationDir, storedName);
      const relPath = path
        .relative(path.resolve(process.cwd(), "uploads"), absPath)
        .replace(/\\/g, "/");

      await fs.writeFile(absPath, file.buffer);

      // Get document type from file object (pv, po, invoice) or default to "General"
      const docType = file.documentType
        ? file.documentType.toUpperCase()
        : "General";

      documentRows.push({
        it_item_id: itItemId,
        document_type: docType,
        file_name: safeName,
        file_path: relPath,
        file_size: file.size || 0,
        mime_type: file.mimetype || "application/pdf",
        uploaded_by: uploaderNik,
      });
    }

    if (documentRows.length > 0) {
      await AssetDocument.bulkCreate(documentRows, {
        transaction,
        returning: false,
      });
    }
    return documentRows;
  }

  /**
   * Main CREATE workflow - NEW METHOD
   */
  static async createAsset(payload, req, transaction) {
    const uploaderNik = req.user?.nik || "SYSTEM";
    const uploaderName = req.user?.nama || uploaderNik;

    // Validasi required
    const noAsset = payload.noAsset?.trim();
    if (!noAsset) {
      throw new Error("Nomor Asset (noAsset) wajib diisi");
    }

    // Check duplicate
    const existing = await loadAssetByNo(noAsset, transaction);
    if (existing) {
      throw new Error(`Asset dengan nomor ${noAsset} sudah ada`);
    }

    // Generate ID
    const itItemId = crypto.randomUUID();

    // Resolve category hierarchy
    const { subCategoryId, categoryId } = await this.resolveCategoryHierarchy(
      payload,
      transaction,
    );

    // Prepare ITItem data
    const tahunBeli = payload.tahunBeli;
    let period = null;
    if (tahunBeli) {
      const date = new Date(tahunBeli);
      if (!isNaN(date.getTime())) {
        period = `${date.getFullYear().toString().padStart(4, "0")}`;
      }
    }

    const ITItem = db.ITItem;
    await ITItem.create(
      {
        it_item_id: itItemId,
        asset_tag: noAsset,
        sub_category_id: subCategoryId,
        category_id: categoryId,
        classification_id: payload.classification_id
          ? Number(payload.classification_id)
          : 1,
        current_status: payload.status || "Active",
        po_date_period: period,
        inspection_date_period: payload.inspection_date_period || period,
        acquisition_status: "Acquired",
        is_disposed: payload.is_disposed || false,
        po_number: payload.po_number || null,
        invoice_number: payload.invoice_number || null,
        request_id: payload.request_id || null,
        depreciation_end_date: payload.depreciation_end_date || null,
        disposal_plan_date: payload.disposal_plan_date || null,
        extend_warranty_date: payload.extend_warranty_date || null,
        purchase_price_actual: Number(payload.purchase_price_actual) || null,
        purchase_price_plan: Number(payload.purchase_price_plan) || null,
        at_cost_value: Number(payload.at_cost_value) || null,
        initial_depreciation: Number(payload.initial_depreciation) || null,
        useful_life_year: parseInt(payload.tahunDepreciation) || null,
        asset_main_type_id: payload.asset_main_type_id
          ? Number(payload.asset_main_type_id)
          : null,
        asset_group_id: payload.asset_group_id
          ? Number(payload.asset_group_id)
          : null,
        line_code: payload.line_code || null,
      },
      { transaction },
    );

    // Assignment
    if (payload.nik) {
      await this.handleAssetAssignment(itItemId, payload.nik, transaction);
    }

    // Network - hostname + IP fields
    if (payload.hostname) {
      await this.handleAssetNetwork(itItemId, payload.hostname, transaction);
    }

    await this.upsertNetworkEntry(
      itItemId,
      {
        hostname: payload.hostname,
        ipAddress: payload.mainIpAdress,
        macAddress: payload.mac_address,
        isPrimary: true,
      },
      transaction,
    );

    await this.upsertNetworkEntry(
      itItemId,
      {
        hostname: payload.hostname,
        ipAddress: payload.backupIpAdress,
        macAddress: payload.mac_address,
        isPrimary: false,
      },
      transaction,
    );

    // Nama attribute
    if (payload.nama) {
      await this.saveAssetName(itItemId, payload.nama, transaction);
    }

    // Initial status history
    await this.createStatusHistory(
      itItemId,
      payload.status || "Active",
      transaction,
    );

    // Audit log
    await this.createAuditLog(
      itItemId,
      noAsset,
      "CREATED",
      payload,
      req,
      uploaderNik,
      uploaderName,
      transaction,
    );

    // Documents
    const files = (req.files || []).filter(
      (f) =>
        f.fieldname === "attachments" ||
        /^attachments\[\d+\]$/.test(f.fieldname),
    );
    await this.uploadAssetDocuments(itItemId, files, uploaderNik, transaction);

    // Return created asset
    return await loadAssetByNo(noAsset, transaction);
  }

  /**
   * Main UPDATE workflow
   */
  static async updateAsset(payload, req, foundAsset, transaction) {
    const itemId = foundAsset.it_item_id;
    const uploaderNik = req.user?.nik || "SYSTEM";
    const uploaderName = req.user?.nama || uploaderNik;
    const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

    // Resolve new hierarchy if changed
    const { subCategoryId, categoryId } = await this.resolveCategoryHierarchy(
      payload,
      transaction,
    );

    // Update ITItem
    const updateData = {
      sub_category_id: subCategoryId || foundAsset.sub_category_id,
      category_id: categoryId || foundAsset.category_id,
      current_status: payload.status || foundAsset.current_status,
      po_number:
        payload.po_number !== undefined
          ? payload.po_number || null
          : foundAsset.po_number,
      invoice_number:
        payload.invoice_number !== undefined
          ? payload.invoice_number || null
          : foundAsset.invoice_number,
      request_id:
        payload.request_id !== undefined
          ? payload.request_id || null
          : foundAsset.request_id,
      depreciation_end_date:
        payload.depreciation_end_date !== undefined
          ? payload.depreciation_end_date || null
          : foundAsset.depreciation_end_date,
      disposal_plan_date:
        payload.disposal_plan_date !== undefined
          ? payload.disposal_plan_date || null
          : foundAsset.disposal_plan_date,
      extend_warranty_date:
        payload.extend_warranty_date !== undefined
          ? payload.extend_warranty_date || null
          : foundAsset.extend_warranty_date,
      purchase_price_actual:
        payload.purchase_price_actual !== undefined
          ? Number(payload.purchase_price_actual) || null
          : foundAsset.purchase_price_actual,
      purchase_price_plan:
        payload.purchase_price_plan !== undefined
          ? Number(payload.purchase_price_plan) || null
          : foundAsset.purchase_price_plan,
      at_cost_value:
        payload.at_cost_value !== undefined
          ? Number(payload.at_cost_value) || null
          : foundAsset.at_cost_value,
      initial_depreciation:
        payload.initial_depreciation !== undefined
          ? Number(payload.initial_depreciation) || null
          : foundAsset.initial_depreciation,
      is_disposed:
        payload.is_disposed !== undefined
          ? payload.is_disposed
          : foundAsset.is_disposed,
      asset_tag: payload.noAsset || foundAsset.asset_tag,
      asset_main_type_id: payload.asset_main_type_id
        ? Number(payload.asset_main_type_id)
        : foundAsset.asset_main_type_id,
      asset_group_id: payload.asset_group_id
        ? Number(payload.asset_group_id)
        : foundAsset.asset_group_id,
      line_code:
        payload.line_code !== undefined
          ? payload.line_code || null
          : foundAsset.line_code,
      inspection_date_period:
        payload.inspection_date_period !== undefined
          ? payload.inspection_date_period || null
          : foundAsset.inspection_date_period,
    };

    const ITItem = db.ITItem;
    await ITItem.update(updateData, {
      where: { it_item_id: itemId },
      transaction,
    });

    // Handle assignment if NIK changed
    if (hasOwn(payload, "nik")) {
      await this.handleAssetAssignment(itemId, payload.nik, transaction);
    }

    // Network if hostname changed
    if (hasOwn(payload, "hostname")) {
      await this.handleAssetNetwork(itemId, payload.hostname, transaction);
    }

    // Update nama
    if (hasOwn(payload, "nama")) {
      await this.saveAssetName(itemId, payload.nama, transaction);
    }

    // Status history if changed
    const newStatus = payload.status || foundAsset.current_status;
    if (newStatus !== foundAsset.current_status) {
      await this.createStatusHistory(itemId, newStatus, transaction);
    }

    // Audit log
    await this.createAuditLog(
      itemId,
      foundAsset.asset_tag,
      "UPDATED",
      payload,
      req,
      uploaderNik,
      uploaderName,
      transaction,
    );

    // New documents
    const files = (req.files || []).filter(
      (f) =>
        f.fieldname === "attachments" ||
        /^attachments\[\d+\]$/.test(f.fieldname),
    );
    await this.uploadAssetDocuments(itemId, files, uploaderNik, transaction);

    // Return updated asset
    const updatedNoAsset = payload.noAsset || foundAsset.asset_tag;
    return await loadAssetByNo(updatedNoAsset, transaction);
  }
}

export default AssetService;
