import { db } from "../../models/index.js";
import fs from "fs/promises";
import path from "path";

const ASSET_DOCUMENT_BASE_DIR = path.resolve(process.cwd(), "uploads", "asset-documents");

export const deleteAssetDocument = async (req, res) => {
  const { assetNo, documentId } = req.params;

  if (!assetNo || !documentId) {
    return res.status(400).json({ 
      success: false, 
      message: "Asset No dan Document ID wajib diisi" 
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    const AssetDocument = db.AssetDocument;

    if (!AssetDocument) {
      throw new Error("Model AssetDocument belum tersedia.");
    }

    // Find the document
    const document = await AssetDocument.findOne({
      where: { 
        document_id: documentId,
      },
      transaction,
    });

    if (!document) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Dokumen tidak ditemukan" 
      });
    }

    // Verify the document belongs to the asset
    const ITItem = db.ITItem;
    const item = await ITItem.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { asset_tag: assetNo },
          { accounting_asset_no: assetNo },
        ]
      },
      transaction,
    });

    if (!item || item.it_item_id !== document.it_item_id) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false, 
        message: "Dokumen tidak terhubung dengan aset ini" 
      });
    }

    // Get file path for deletion
    const filePath = document.file_path;
    
    // Delete from database first
    await AssetDocument.destroy({
      where: { document_id: documentId },
      transaction,
    });

    // Commit database transaction
    await transaction.commit();

    // Try to delete physical file (don't fail if file doesn't exist)
    if (filePath) {
      try {
        const absolutePath = path.resolve(process.cwd(), "uploads", filePath);
        await fs.unlink(absolutePath);
      } catch (fileError) {
        console.warn("Gagal menghapus file fisik:", fileError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: "Dokumen berhasil dihapus" 
    });

  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Delete document error:", error);
    return res.status(500).json({ 
      success: false, 
      message: `Gagal menghapus dokumen: ${error.message}` 
    });
  }
};

