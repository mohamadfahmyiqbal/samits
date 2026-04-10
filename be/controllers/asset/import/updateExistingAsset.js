import { db } from "../../../models/index.js";
import upsertItemAssignment from "./upsertItemAssignment.js";
import upsertItemAttributes from "./upsertItemAttributes.js";
import upsertItemNetwork from "./upsertItemNetwork.js";

const updateExistingAsset = async (assets, transaction) => {
  const {
    it_items = {},
    it_item_assignments = {},
    it_item_networks = {},
    it_item_attributes = {},
  } = assets || {};

  const itemId = it_items.it_item_id;

  if (!itemId) {
    throw new Error("it_item_id is required for updateExistingAsset");
  }

  await db.ITItem.update(
    {
      current_status: it_items.current_status || "Active",
      it_classification_id: it_items.classification_id || null,
      po_number: it_items.po_number || null,
      po_date_period: it_items.po_date_period || null,
      inspection_date_period:
        it_items.inspection_date_period || null,
      depreciation_end_date:
        it_items.depreciation_end_date || null,
      disposal_plan_date:
        it_items.disposal_plan_date || null,
      extend_warranty_date:
        it_items.extend_warranty_date || null,
      acquisition_status:
        it_items.acquisition_status || "Acquired",
      is_disposed: Number(it_items.is_disposed || 0),
      sub_category_id: it_items.sub_category_id || null,
      category_id: it_items.category_id || null,
      asset_group_id: it_items.asset_group_id || null,
      asset_main_type_id: it_items.asset_main_type_id
        ? Number(it_items.asset_main_type_id)
        : null,
      classification_id:
        it_items.classification_id || null,
      request_id: it_items.request_id || null,
      purchase_price_plan:
        it_items.purchase_price_plan || null,
      purchase_price_actual:
        it_items.purchase_price_actual || null,
      no_cip: it_items.no_cip || null,
      invoice_number:
        it_items.invoice_number || null,
    },
    {
      where: {
        it_item_id: itemId,
      },
      transaction,
    }
  );

  await upsertItemAssignment(
    itemId,
    it_item_assignments,
    transaction
  );

  await upsertItemNetwork(
    itemId,
    it_item_networks,
    transaction
  );

  await upsertItemAttributes(
    itemId,
    it_item_attributes,
    transaction
  );

  return {
    success: true,
    it_item_id: itemId,
  };
};

export default updateExistingAsset;