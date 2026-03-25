import { loadAssetByNo } from "./shared.js";

export const getAssetDetails = async (req, res) => {
  try {
    const assetNo = String(req.params.id || "").trim();
    const asset = await loadAssetByNo(assetNo);
    if (!asset) {
      return res.status(404).json({ message: "Asset tidak ditemukan" });
    }
    return res.status(200).json({ data: asset });
  } catch (error) {
    console.error("Get asset details error:", error);
    return res.status(500).json({ message: "Gagal mengambil detail asset dari database." });
  }
};
