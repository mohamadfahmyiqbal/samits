import { db } from "../../models/index.js";

export const listClassifications = async (req, res) => {
  try {
    const ITClassification = db.ITClassification;

    if (!ITClassification) {
      throw new Error("Model ITClassification belum tersedia.");
    }

    const rows = await ITClassification.findAll({
      attributes: ["classification_id", "classification_name"],
      order: [["classification_name", "ASC"]],
    });

    const data = rows.map((row) => ({
      classification_id: row.classification_id,
      classification_name: row.classification_name,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("List classifications error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar classifications dari database." });
  }
};

