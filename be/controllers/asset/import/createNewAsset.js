import { db } from "../../../models/index.js";
import upsertItemAssignment from "./upsertItemAssignment.js";
import upsertItemNetwork from "./upsertItemNetwork.js";
import upsertItemAttributes from "./upsertItemAttributes.js";

const createNewAsset = async (assets, transaction) => {
  const {
    it_items = {},
    it_item_assignments = {},
    it_item_networks = {},
    it_item_attributes = {},
  } = assets || {};

  const itemId = it_items.it_item_id;

  if (!itemId) {
    throw new Error("it_item_id is required for createNewAsset");
  }

  await db.ITItem.create(
    {
      ...it_items,
    },
    { transaction }
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

export default createNewAsset;