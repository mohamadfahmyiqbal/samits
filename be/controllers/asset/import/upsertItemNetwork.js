import { Op } from "sequelize";
import { db, sequelize } from "../../../models/index.js";
import { logger } from "./logger.js";
import { debugLog } from "./helpers.js";

const upsertItemNetwork = async (itemId, asset, transaction) => {
 const noAsset = String(asset?.noAsset || asset?.["NO.ASSET"] || "").trim();
 try {
  const hostname = String(asset?.hostname || "").trim();
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
   { hostname: hostname, ip_address: asset.ip_address || null || null, updated_at: nowLiteral },
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

export default upsertItemNetwork;