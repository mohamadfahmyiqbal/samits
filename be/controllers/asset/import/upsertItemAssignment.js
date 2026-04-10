import { db, sequelize } from "../../../models/index.js";
import { Op } from "sequelize";
import { logger } from "./logger.js";
import { debugLog } from "./helpers.js";

const upsertItemAssignment = async (itemId, asset, transaction) => {
 const noAsset = String(asset?.noAsset || asset?.["NO.ASSET"] || "").trim();
 try {
  const nik = String(asset?.nik || "").trim();
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

export default upsertItemAssignment;