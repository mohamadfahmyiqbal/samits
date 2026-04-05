import { loadAssetByNo } from "./shared.js";

export const getAssetDetails = async (req, res) => {
  try {
    const assetNo = String(req.params.id || "").trim();
    console.log("[DEBUG] getAssetDetails for:", assetNo);
    const asset = await loadAssetByNo(assetNo);
    if (!asset) {
      return res.status(404).json({ message: "Asset tidak ditemukan" });
    }
    console.log("[DEBUG] Documents count:", asset.documents?.length || 0);
    console.log(
      "[DEBUG] Documents:",
      JSON.stringify(
        asset.documents?.map((d) => ({
          id: d.document_id,
          type: d.document_type,
          name: d.original_name,
        })),
      ),
    );
    return res.status(200).json({ data: asset });
  } catch (error) {
    console.error("Get asset details error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil detail asset dari database." });
  }
};
