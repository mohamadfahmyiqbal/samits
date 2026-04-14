import { db } from "../../models/index.js";

export { db };

export const getMaintenancePlanModel =
  () => {
    if (!db.MaintenancePlan) {
      throw new Error(
        "Model MaintenancePlan belum tersedia (belum diinisialisasi)."
      );
    }

    return db.MaintenancePlan;
  };

export const getITItemModel = () => {
  if (!db.ITItem) {
    throw new Error(
      "Model ITItem belum tersedia. Pastikan initializeDB sudah dijalankan."
    );
  }

    return db.ITItem;
};

export const getMaintenancePlanAssetModel =
  () => {
    if (!db.MaintenancePlanAsset) {
      throw new Error(
        "Model MaintenancePlanAsset belum tersedia (belum diinisialisasi)."
      );
    }

    return db.MaintenancePlanAsset;
  };