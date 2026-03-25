// routes/asset/asset.routes.js

import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/auth.middleware.js'; 
import { listAssetGroups, listMainTypes } from "../controllers/asset/listAssetGroupsController.js";
import { listStatuses } from "../controllers/asset/listStatusesController.js";
import { listItItems } from "../controllers/asset/listAssetsController.js";
import { listCategories } from "../controllers/asset/listCategoriesController.js";
import { listCategoryTypes } from "../controllers/asset/listCategoryTypesController.js";
import { listSubCategories } from "../controllers/asset/listSubCategoriesController.js";
import { listClassifications } from "../controllers/asset/listClassificationsController.js";
import { createAsset } from "../controllers/asset/createAssetController.js";
import { getAssetDetails } from "../controllers/asset/getAssetDetailsController.js";
import { updateAsset } from "../controllers/asset/updateAssetController.js";
import { deleteAsset } from "../controllers/asset/deleteAssetController.js";
import { deleteAssetDocument } from "../controllers/asset/deleteAssetDocumentController.js";
import { importAssets, importAssetsFromExcel } from "../controllers/asset/importAssetsController.js";
import { getSubCategoryDetails } from "../controllers/asset/getSubCategoryDetailsController.js";

const router = express.Router();
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const assetDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const fileName = String(file?.originalname || "").toLowerCase();
    const isPdf =
      String(file?.mimetype || "").toLowerCase() === "application/pdf" || fileName.endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Hanya lampiran PDF yang diperbolehkan."));
    }
    return cb(null, true);
  },
});

// Import endpoint dibuka tanpa token (sesuai kebutuhan import massal)
router.post('/import', importAssets);
router.post('/import-excel', excelUpload.single('file'), importAssetsFromExcel);

// Route aset lainnya tetap memerlukan token JWT
router.use(authMiddleware);

// 0. GET: /api/assets/groups - Ambil daftar asset group dari database
router.get('/groups', listAssetGroups);

// 0b. GET: /api/assets/statuses - Ambil daftar status dari database
router.get('/statuses', listStatuses);

// 0a. GET: /api/assets/main-types - Ambil daftar main types dari database
router.get('/main-types', listMainTypes);

// 1. GET: /api/assets?group=utama/client (List semua aset dengan filtering)
router.get('/', listItItems);

// 2. GET SPESIFIK: /api/assets/categories
// PENTING: Route SPESIFIK ini harus diletakkan sebelum route dinamis /:id
router.get('/categories', listCategories);

// 3. GET SPESIFIK: /api/assets/category-types
// Daftar kategori beserta sub kategori (types) dari master data
router.get('/category-types', listCategoryTypes);

// 4. GET SPESIFIK: /api/assets/sub-categories
// Daftar sub kategori dari master data
router.get('/sub-categories', listSubCategories);

// 5. GET SPESIFIK: /api/assets/classifications
// Daftar classifications dari master data
router.get('/classifications', listClassifications);

// 6. POST: /api/assets (Create Asset)
router.post('/', assetDocumentUpload.any(), createAsset);

// 7. GET DINAMIS: /api/assets/:id (Get Asset Details berdasarkan noAsset)
router.get('/:id', getAssetDetails);

// 8. PUT: /api/assets/:id (Update Asset berdasarkan noAsset)
router.put('/:id', assetDocumentUpload.any(), updateAsset);

// 9. DELETE: /api/assets/:id (Delete Asset berdasarkan noAsset)
router.delete('/:id', deleteAsset);

// 10. DELETE: /api/assets/:id/documents/:documentId (Delete Document)
router.get('/subcategory/:id', getSubCategoryDetails);

router.delete('/:assetNo/documents/:documentId', deleteAssetDocument);

export default router;
