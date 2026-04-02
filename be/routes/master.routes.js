// Master Data Routes
import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import partCategoryService from '../services/partCategory.service.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validasi input gagal',
    });
  }
  return next();
};

// Simple placeholder routes (use actual implementations when ready)
router.get('/categories', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Categories retrieved successfully' });
}));

router.post('/categories', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Category created successfully' });
}));

router.get('/locations', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Locations retrieved successfully' });
}));

router.post('/locations', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Location created successfully' });
}));

router.get('/vendors', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Vendors retrieved successfully' });
}));

router.post('/vendors', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Vendor created successfully' });
}));

router.get('/departments', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Departments retrieved successfully' });
}));

router.post('/departments', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Department created successfully' });
}));

router.get('/roles', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Roles retrieved successfully' });
}));

router.post('/roles', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Role created successfully' });
}));

router.get('/asset-types', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Asset types retrieved successfully' });
}));

router.post('/asset-types', authMiddleware, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Asset type created successfully' });
}));

// Part Category Routes
router.get(
  '/part-categories',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await partCategoryService.listPartCategories();
    res.json({
      success: true,
      data,
      message: 'Part categories retrieved successfully',
    });
  }),
);

router.post(
  '/part-categories',
  authMiddleware,
  [
    body('category_name').notEmpty().withMessage('Part category name is required'),
    body('category_code').notEmpty().withMessage('Part category code is required'),
    body('description').optional().isString(),
    body('status').notEmpty().withMessage('Status is required'),
    body('minimum_threshold').optional().isInt({ min: 1 }),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const created = await partCategoryService.createPartCategory(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Part category created successfully',
    });
  }),
);

router.put(
  '/part-categories/:id',
  authMiddleware,
  [
    body('category_name').optional().notEmpty().withMessage('Part category name is required'),
    body('category_code').optional().notEmpty().withMessage('Part category code is required'),
    body('description').optional().isString(),
    body('status').optional().notEmpty(),
    body('minimum_threshold').optional().isInt({ min: 1 }),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const updated = await partCategoryService.updatePartCategory(req.params.id, req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Part category updated successfully',
    });
  }),
);

router.delete(
  '/part-categories/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    await partCategoryService.deletePartCategory(req.params.id);
    res.json({
      success: true,
      message: 'Part category deleted successfully',
    });
  }),
);

export default router;
