import { Op } from "sequelize";
import { db } from "../../../models/index.js";
import { safeTrim } from "./helpers.js";

const findExistingAsset = async (
  noAsset,
  transaction
) => {
  const normalizedNoAsset = safeTrim(noAsset);

  if (!normalizedNoAsset) return null;

  const existing = await db.ITItem.findOne({
    where: {
      [Op.or]: [
        { asset_tag: normalizedNoAsset },
        { accounting_asset_no: normalizedNoAsset },
      ],
    },
    transaction,
  });
  

  return existing;
};

export default findExistingAsset;