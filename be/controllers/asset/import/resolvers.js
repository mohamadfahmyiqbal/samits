import { sequelize, db } from "../../../models/index.js";
import { Op } from "sequelize";
import {
  resolveClassificationId,
  resolveSubCategoryId,
} from "../shared.js";

export const resolveAssetCategory = async (
  asset,
  notFoundCategories = []
) => {
  const typeName = String(asset?.type || "").trim();

  let subCategoryId = null;
  let subCategory = null;

  try {
    subCategoryId = await resolveSubCategoryId(
      { type: typeName },
      null
    );

    if (subCategoryId) {
      subCategory = await db.ITSubCategory.findOne({
        where: {
          sub_category_id: subCategoryId,
        },
      });
    }
  } catch (_) {}

  // fallback from asset group
  if (!subCategory) {
    const assetGroup = await db.ITAssetGroup.findOne({
      where: sequelize.where(
        sequelize.fn(
          "LOWER",
          sequelize.fn(
            "LTRIM",
            sequelize.fn(
              "RTRIM",
              sequelize.col("asset_group_name")
            )
          )
        ),
        typeName.toLowerCase()
      ),
      order: [["asset_group_id", "ASC"]],
    });

    if (assetGroup?.sub_category_id) {
      subCategory = await db.ITSubCategory.findOne({
        where: {
          sub_category_id:
            assetGroup.sub_category_id,
        },
      });

      subCategoryId =
        assetGroup.sub_category_id;
    }
  }

  if (!subCategory) {
    if (
      typeName &&
      !notFoundCategories.includes(typeName)
    ) {
      notFoundCategories.push(typeName);
    }

    throw new Error(
      `Sub kategori tidak ditemukan. type="${typeName}", category="-", assetGroup="-".`
    );
  }

  return {
    subCategoryId,
    categoryId: subCategory.it_category_id,
  };
};

export const resolveItemClassification =
  async () => {
    return resolveClassificationId(null);
  };