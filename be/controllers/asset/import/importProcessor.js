import {
  createItem,
  findExistingAsset,
  updateItem,
} from "./itemService.js";
import {
  resolveAssetCategory,
  resolveItemClassification,
} from "./resolvers.js";

const buildPeriod = (tahunBeli) =>
  tahunBeli && /^\d{4}$/.test(tahunBeli)
    ? `${tahunBeli}01`
    : null;

export const processAssetImport = async (
  asset,
  results,
  transaction
) => {
  const existing = await findExistingAsset(
    asset.noAsset,
    transaction
  );

  const period = buildPeriod(asset.tahunBeli);

  if (existing) {
    await updateItem(
      existing.it_item_id,
      {
        current_status: asset.status,
        po_date_period: period,
        inspection_date_period: period,
      },
      transaction
    );

    results.updated++;
    return;
  }

  const { subCategoryId, categoryId } =
    await resolveAssetCategory(
      asset,
      results.notFoundCategories
    );

  const classificationId =
    await resolveItemClassification();

  await createItem(
    {
      sub_category_id: subCategoryId,
      category_id: categoryId,
      classification_id: classificationId,
      asset_tag: asset.noAsset,
      current_status: asset.status,
      po_date_period: period,
      inspection_date_period: period,
      acquisition_status: "Acquired",
      is_disposed: false,
    },
    transaction
  );

  results.created++;
};