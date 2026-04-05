import { db } from "../../models/index.js";

export const getSubCategoryDetails = async (req, res) => {
  try {
    const subCategoryId = parseInt(req.params.id, 10);
    
    if (isNaN(subCategoryId)) {
      return res.status(400).json({ 
        success: false, 
        message: "sub_category_id harus berupa angka valid" 
      });
    }

    const ITSubCategory = db.ITSubCategory;
    const ITCategory = db.ITCategory;
    
    if (!ITSubCategory) {
      throw new Error("Model ITSubCategory belum tersedia.");
    }

    const subCategory = await ITSubCategory.findByPk(subCategoryId, {
      include: [{
        model: ITCategory,
        as: "category",
        required: true,
        attributes: [
          "it_category_id", 
          "category_name", 
          "asset_main_type_id", 
          "asset_type",
          "asset_group"
        ]
      }],
      attributes: ["sub_category_id", "sub_category_name", "it_category_id"]
    });

    if (!subCategory) {
      return res.status(404).json({ 
        success: false, 
        message: "Sub kategori tidak ditemukan" 
      });
    }

    const responseData = {
      success: true,
      data: {
        sub_category_id: subCategory.sub_category_id,
        sub_category_name: subCategory.sub_category_name,
        it_category_id: subCategory.it_category_id,
        category_name: subCategory.category.category_name,
        asset_main_type_id: subCategory.category.asset_main_type_id,
        asset_type: subCategory.category.asset_type,
        asset_group: subCategory.category.asset_group
      }
    };

    console.log("[SUBCAT DETAILS]", responseData.data);
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get sub category details error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil detail sub kategori" 
    });
  }
};

