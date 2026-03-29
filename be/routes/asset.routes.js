// routes/asset/asset.routes.js

import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  listAssetGroups,
  listMainTypes,
} from "../controllers/asset/listAssetGroupsController.js";
import { listStatuses } from "../controllers/asset/listStatusesController.js";
import { listCategories } from "../controllers/asset/listCategoriesController.js";
import { listCategoryTypes } from "../controllers/asset/listCategoryTypesController.js";
import { listClassifications } from "../controllers/asset/listClassificationsController.js";
import { listSubCategories } from "../controllers/asset/listSubCategoriesController.js";
import { getSubCategoryDetails } from "../controllers/asset/getSubCategoryDetailsController.js";
import { listItItems } from "../controllers/asset/listAssetsController.js";
import { getAssetDetails } from "../controllers/asset/getAssetDetailsController.js";
import { createAsset } from "../controllers/asset/CreateAsset.js";
import { updateAsset } from "../controllers/asset/updateAssetController.js";
import { deleteAsset } from "../controllers/asset/deleteAssetController.js";
import { deleteAssetDocument } from "../controllers/asset/deleteAssetDocumentController.js";
import { importAssets } from "../controllers/asset/importAssetsController.js";

const router = express.Router();

// Middleware for file upload - store in memory for processing
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept any file field name
    cb(null, true);
  },
});

// Asset Groups and Main Types
router.get("/asset-groups", authMiddleware, listAssetGroups);
router.get("/main-types", authMiddleware, listMainTypes);

// Asset Statuses
router.get("/statuses", authMiddleware, listStatuses);

// Asset Categories
router.get("/categories", authMiddleware, listCategories);
router.get("/category-types", authMiddleware, listCategoryTypes);
router.get("/classifications", authMiddleware, listClassifications);
router.get("/subcategories", authMiddleware, listSubCategories);
router.get("/subcategories/:id/details", authMiddleware, getSubCategoryDetails);

// Asset CRUD Operations
router.get("/", authMiddleware, listItItems);
router.get("/:id", authMiddleware, getAssetDetails);
router.post("/", authMiddleware, upload.array("attachments", 10), createAsset);
router.put(
  "/:id",
  authMiddleware,
  upload.array("attachments", 10),
  updateAsset,
);
router.delete("/:id", authMiddleware, deleteAsset);
router.delete("/:id/documents/:docId", authMiddleware, deleteAssetDocument);

// Asset Import
router.post("/import", authMiddleware, upload.single("file"), importAssets);

export default router;
