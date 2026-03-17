import { db, sequelize } from "../../models/index.js";
import { loadAssetByNo } from "./shared.js";
import { emitToAllClients } from "../../services/realtime.service.js";
import AssetServiceClass from '../../services/asset.service.js';

export const updateAsset = async (req, res) => {
  console.log('[UPDATE ASSET] Using service layer');
  
  const transaction = await sequelize.transaction();
  const safeRollback = async () => transaction?.rollback().catch(console.error);

  try {
    const payload = req.body || {};
    const assetNo = payload.originalNoAsset || req.params.id;
    
    const found = await loadAssetByNo(assetNo, transaction);
    if (!found) {
      await safeRollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Asset tidak ditemukan' 
      });
    }

    // Service handles update logic
    const result = await AssetServiceClass.updateAsset(payload, req, found, transaction);
    
    await transaction.commit();
    
    emitToAllClients('asset:updated', {
      data: result,
      originalNoAsset: assetNo,
      actor_nik: req.user?.nik,
      at: new Date().toISOString()
    });

    return res.json({ 
      success: true,
      message: 'Asset berhasil diupdate',
      data: result 
    });
  } catch (error) {
    await safeRollback();
    console.error('UPDATE ASSET ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
