import { Op } from "sequelize";
import { db, sequelize } from "../../../models/index.js";
import { logger } from "./logger.js";
import { debugLog } from "./helpers.js";

const upsertItemAttributes = async (
  itemId,
  asset,
  transaction
) => {
  const attrName = asset?.attr_name;
  const attrValue = asset?.attr_value;

  if (!attrName || !attrValue) return;

  const existing = await db.ITItemAttribute.findOne({
    where: {
      it_item_id: itemId,
      attr_name: attrName,
    },
    transaction,
  });

  if (existing) {
    await db.ITItemAttribute.update(
      { attr_value: attrValue },
      {
        where: {
          it_item_id: itemId,
          attr_name: attrName,
        },
        transaction,
      }
    );
  } else {
    await db.ITItemAttribute.create(
      {
        it_item_id: itemId,
        attr_name: attrName,
        attr_value: attrValue,
      },
      { transaction }
    );
  }
};

export default upsertItemAttributes;