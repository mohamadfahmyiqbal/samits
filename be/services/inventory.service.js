// Inventory Service
import { Op } from 'sequelize';
import winston from 'winston';
import {
  Stock,
  Part,
  PartCategory,
  MinimumStock,
  StockMovement,
  Location
} from '../models/index.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/inventory.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class InventoryService {
  // Get all stock items
  static async getAllStocks(filters = {}) {
    try {
      const where = {};
      
      if (filters.partId) where.partId = filters.partId;
      if (filters.locationId) where.locationId = filters.locationId;
      if (filters.minQuantity) where.quantity = { [Op.gte]: filters.minQuantity };
      if (filters.maxQuantity) where.quantity = { [Op.lte]: filters.maxQuantity };

      const stocks = await Stock.findAll({
        where,
        include: [
          {
            model: Part,
            include: [{ model: PartCategory }]
          },
          { model: Location }
        ],
        order: [['updatedAt', 'DESC']]
      });

      return {
        success: true,
        data: stocks,
        total: stocks.length
      };
    } catch (error) {
      logger.error('Error getting stocks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get minimum stock alerts
  static async getMinimumStockAlerts() {
    try {
      const alerts = await MinimumStock.findAll({
        include: [
          {
            model: Part,
            include: [{ model: PartCategory }]
          },
          { model: Location }
        ],
        where: {
          currentStock: {
            [Op.lte]: sequelize.col('minimumQuantity')
          }
        },
        order: [['currentStock', 'ASC']]
      });

      return {
        success: true,
        data: alerts,
        total: alerts.length
      };
    } catch (error) {
      logger.error('Error getting minimum stock alerts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add stock movement
  static async addStockMovement(movementData) {
    try {
      const { partId, locationId, quantity, movementType, reference, notes } = movementData;

      // Validate movement type
      if (!['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].includes(movementType)) {
        return {
          success: false,
          error: 'Invalid movement type'
        };
      }

      // Get current stock
      const currentStock = await Stock.findOne({
        where: { partId, locationId }
      });

      if (!currentStock) {
        return {
          success: false,
          error: 'Stock not found for this part and location'
        };
      }

      // Calculate new quantity
      let newQuantity = currentStock.quantity;
      switch (movementType) {
        case 'IN':
          newQuantity += quantity;
          break;
        case 'OUT':
          if (newQuantity < quantity) {
            return {
              success: false,
              error: 'Insufficient stock'
            };
          }
          newQuantity -= quantity;
          break;
        case 'TRANSFER':
          // Handle transfer logic
          if (!movementData.targetLocationId) {
            return {
              success: false,
              error: 'Target location required for transfer'
            };
          }
          break;
        case 'ADJUSTMENT':
          newQuantity = quantity;
          break;
      }

      // Create stock movement record
      const movement = await StockMovement.create({
        partId,
        locationId,
        quantity,
        movementType,
        previousQuantity: currentStock.quantity,
        newQuantity,
        reference,
        notes,
        userId: movementData.userId
      });

      // Update stock quantity
      await currentStock.update({ quantity: newQuantity });

      // Handle transfer if applicable
      if (movementType === 'TRANSFER') {
        const targetStock = await Stock.findOne({
          where: { 
            partId, 
            locationId: movementData.targetLocationId 
          }
        });

        if (targetStock) {
          await targetStock.update({
            quantity: targetStock.quantity + quantity
          });
        } else {
          await Stock.create({
            partId,
            locationId: movementData.targetLocationId,
            quantity
          });
        }
      }

      // Update minimum stock if exists
      const minStock = await MinimumStock.findOne({
        where: { partId, locationId }
      });

      if (minStock) {
        await minStock.update({ currentStock: newQuantity });
      }

      return {
        success: true,
        data: movement,
        message: 'Stock movement recorded successfully'
      };
    } catch (error) {
      logger.error('Error adding stock movement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get stock movements
  static async getStockMovements(filters = {}) {
    try {
      const where = {};
      
      if (filters.partId) where.partId = filters.partId;
      if (filters.locationId) where.locationId = filters.locationId;
      if (filters.movementType) where.movementType = filters.movementType;
      if (filters.startDate) {
        where.createdAt = {
          [Op.gte]: new Date(filters.startDate)
        };
      }
      if (filters.endDate) {
        where.createdAt = {
          ...where.createdAt,
          [Op.lte]: new Date(filters.endDate)
        };
      }

      const movements = await StockMovement.findAll({
        where,
        include: [
          {
            model: Part,
            include: [{ model: PartCategory }]
          },
          { model: Location }
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100
      });

      return {
        success: true,
        data: movements,
        total: movements.length
      };
    } catch (error) {
      logger.error('Error getting stock movements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Set minimum stock
  static async setMinimumStock(minStockData) {
    try {
      const { partId, locationId, minimumQuantity } = minStockData;

      const [minStock, created] = await MinimumStock.findOrCreate({
        where: { partId, locationId },
        defaults: {
          minimumQuantity,
          currentStock: 0
        }
      });

      if (!created) {
        await minStock.update({ minimumQuantity });
      }

      return {
        success: true,
        data: minStock,
        message: 'Minimum stock set successfully'
      };
    } catch (error) {
      logger.error('Error setting minimum stock:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get inventory summary
  static async getInventorySummary() {
    try {
      const summary = await Stock.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalItems'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('AVG', sequelize.col('quantity')), 'avgQuantity']
        ]
      });

      const lowStockCount = await MinimumStock.count({
        where: {
          currentStock: {
            [Op.lte]: sequelize.col('minimumQuantity')
          }
        }
      });

      return {
        success: true,
        data: {
          totalItems: summary[0].dataValues.totalItems || 0,
          totalQuantity: summary[0].dataValues.totalQuantity || 0,
          avgQuantity: Math.round(summary[0].dataValues.avgQuantity || 0),
          lowStockAlerts: lowStockCount
        }
      };
    } catch (error) {
      logger.error('Error getting inventory summary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default InventoryService;
