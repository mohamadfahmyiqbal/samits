import fs from "fs/promises";
import path from "path";
import { db, sequelize } from "../../models/index.js";
import { loadAssetByNo } from "./shared.js";

export const deleteAsset = async (req, res) => {
  const transaction = await sequelize.transaction();
  const filesToDelete = [];
  try {
    const noAsset = String(req.params.id || "").trim();
    const found = await loadAssetByNo(noAsset, transaction);

    if (!found) {
      await transaction.rollback();
      return res.status(404).json({ message: "Asset tidak ditemukan untuk dihapus" });
    }

    const itemId = found.id;
    const ITItemNetwork = db.ITItemNetwork;
    const ITItemAssignment = db.ITItemAssignment;
    const ITItemAttribute = db.ITItemAttribute;
    const ITItemSoftware = db.ITItemSoftware;
    const ITItemSetupChecklist = db.ITItemSetupChecklist;
    const AssetDocument = db.AssetDocument;
    const LicenseAllocation = db.LicenseAllocation;
    const ITItem = db.ITItem;

    // Delete related records using ORM
    if (ITItemNetwork) {
      await ITItemNetwork.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (ITItemAssignment) {
      await ITItemAssignment.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (ITItemAttribute) {
      await ITItemAttribute.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (ITItemSoftware) {
      await ITItemSoftware.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (ITItemSetupChecklist) {
      await ITItemSetupChecklist.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (ITItemStatusHistory) {
      await ITItemStatusHistory.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (LicenseAllocation) {
      await LicenseAllocation.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    if (AssetDocument) {
      const docs = await AssetDocument.findAll({
        where: { it_item_id: itemId },
        transaction,
      });
      docs.forEach((doc) => {
        const relativePath = String(doc?.file_path || "").replace(/\\/g, "/");
        if (relativePath) {
          filesToDelete.push(path.resolve(process.cwd(), "uploads", relativePath));
        }
      });
      await AssetDocument.destroy({
        where: { it_item_id: itemId },
        transaction,
      });
    }
    
    // Delete the main item
    await ITItem.destroy({
      where: { it_item_id: itemId },
      transaction,
    });

    await transaction.commit();
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map(async (filePath) => {
          try {
            await fs.unlink(filePath);
          } catch (_err) {
            // no-op: cleanup best effort
          }
        })
      );
    }
    return res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error("Delete asset error:", error);
    return res.status(500).json({ message: `Gagal menghapus asset: ${error.message}` });
  }
};
