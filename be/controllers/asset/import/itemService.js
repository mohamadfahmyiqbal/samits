import crypto from "crypto";
import { db } from "../../../models/index.js";

export const findExistingAsset = async (
  noAsset,
  transaction
) => {
  return db.ITItem.findOne({
    where: {
      asset_tag: noAsset,
    },
    transaction,
  });
};

export const createItem = async (
  payload,
  transaction
) => {
  return db.ITItem.create(
    {
      it_item_id: crypto.randomUUID(),
      ...payload,
    },
    { transaction }
  );
};

export const updateItem = async (
  itItemId,
  payload,
  transaction
) => {
  return db.ITItem.update(payload, {
    where: { it_item_id: itItemId },
    transaction,
  });
};