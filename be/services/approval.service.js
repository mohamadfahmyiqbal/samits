/* be/services/approval.service.js - Approval Business Logic
* Production-ready, standardized response, transaction safe
* Integrasi ApprovalLevel + ApprovalHistory models
*/

import { db, sequelize } from '../models/index.js';
import { errorHandler } from '../utils/errorHandler.js';

const standardizeResponse = ({ success, message, data = null }) => ({
  success,
  message,
  data
});

const handleServiceError = (error, context = '') => {
  console.error(`[SERVICE ${context}] Error:`, error.message);
  const message = process.env.NODE_ENV === 'production' 
    ? 'Service error occurred' 
    : error.message;
  return new Error(message);
};

export class ApprovalService {
  /**
   * Mulai approval request untuk asset
   * @param {string} documentId - noAsset
   * @param {string} documentType - 'asset'
   * @param {string} requesterNik 
   * @returns {Promise} approvalId
   */
  static async createApprovalRequest(documentId, documentType = 'asset', requesterNik, transaction = null) {
    const transactionArg = transaction || await sequelize.transaction();
    
    try {
      // Get first level
      const ApprovalLevel = db.ApprovalLevel;
      const firstLevel = await ApprovalLevel.findOne({
        where: { level_id: 1 },
        transaction: transactionArg,
        lock: transaction ? 'UPDATE' : true
      });

      if (!firstLevel) {
        throw new Error('Level approval pertama tidak ditemukan');
      }

      const ApprovalHistory = db.ApprovalHistory;
      const now = sequelize.getDialect() === 'mssql' ? sequelize.literal('GETDATE()') : new Date();
      
      const [approval, created] = await ApprovalHistory.findOrCreate({
        where: {
          document_type: documentType,
          document_id: documentId,
          step_sequence: 1
        },
        defaults: {
          level_id: firstLevel.level_id,
          approver_nik: null,
          status: 'pending',
          step_sequence: 1,
          notes: `Approval request by ${requesterNik}`,
          created_at: now,
          updated_at: now
        },
        transaction: transactionArg
      });

      if (!created) {
        throw new Error('Approval request sudah ada untuk asset ini');
      }

      if (!transaction) {
        await transactionArg.commit();
      }

      return {
        success: true,
        data: {
          approval_id: approval.approval_id,
          document_id: approval.document_id,
          status: approval.status,
          level_id: approval.level_id,
          step_sequence: approval.step_sequence,
          message: 'Approval request berhasil dibuat'
        }
      };
    } catch (error) {
      if (!transaction) {
        await transactionArg.rollback();
      }
      throw handleServiceError(error, 'Gagal membuat approval request');
    }
  }

  /**
   * Get current approval status
   */
  static async getApprovalStatus(documentId, documentType = 'asset') {
    try {
      const ApprovalHistory = db.ApprovalHistory;
      const latest = await ApprovalHistory.findOne({
        where: { 
          document_type, 
          document_id: documentId 
        },
        order: [['step_sequence', 'DESC'], ['created_at', 'DESC']]
      });

      if (!latest) {
        return {
          success: true,
          data: {
            status: 'not_requested',
            step_sequence: 0,
            levels: []
          }
        };
      }

      return {
        success: true,
        data: {
          status: latest.status,
          level_id: latest.level_id,
          step_sequence: latest.step_sequence,
          approver_nik: latest.approver_nik,
          notes: latest.notes,
          created_at: latest.created_at
        }
      };
    } catch (error) {
      throw handleServiceError(error, 'Gagal ambil status approval');
    }
  }

  /**
   * Approve step saat ini
   */
  static async approveStep(approvalId, approverNik, notes = '', nextLevelId = null, transaction = null) {
    const transactionArg = transaction || await sequelize.transaction();
    
    try {
      const ApprovalHistory = db.ApprovalHistory;
      const approval = await ApprovalHistory.findByPk(approvalId, {
        transaction: transactionArg,
        lock: transaction ? 'UPDATE' : true
      });

      if (!approval || approval.status !== 'pending') {
        throw new Error('Approval tidak valid atau sudah diproses');
      }

      const now = sequelize.getDialect() === 'mssql' ? sequelize.literal('GETDATE()') : new Date();
      
      // Update current step
      await approval.update({
        approver_nik: approverNik,
        status: 'approved',
        notes: notes || `Approved by ${approverNik}`,
        updated_at: now
      }, { transaction: transactionArg });

      // Create next step if specified
      if (nextLevelId) {
        const ApprovalLevel = db.ApprovalLevel;
        const nextLevel = await ApprovalLevel.findByPk(nextLevelId, { transaction: transactionArg });
        if (nextLevel) {
          await ApprovalHistory.create({
            document_type: approval.document_type,
            document_id: approval.document_id,
            level_id: nextLevelId,
            status: 'pending',
            step_sequence: approval.step_sequence + 1,
            notes: `Waiting ${nextLevel.level_name} approval`,
            created_at: now
          }, { transaction: transactionArg });
        }
      }

      if (!transaction) {
        await transactionArg.commit();
      }

      return {
        success: true,
        data: {
          approval_id,
          status: 'approved',
          next_step: nextLevelId ? nextLevelId : null,
          message: 'Approval berhasil'
        }
      };
    } catch (error) {
      if (!transaction) {
        await transactionArg.rollback();
      }
      throw handleServiceError(error, 'Gagal approve');
    }
  }

  /**
   * Reject step
   */
  static async rejectStep(approvalId, approverNik, notes, transaction = null) {
    const transactionArg = transaction || await sequelize.transaction();
    
    try {
      const ApprovalHistory = db.ApprovalHistory;
      const approval = await ApprovalHistory.findByPk(approvalId, {
        transaction: transactionArg,
        lock: true
      });

      if (!approval || approval.status !== 'pending') {
        throw new Error('Approval tidak valid');
      }

      const now = sequelize.getDialect() === 'mssql' ? sequelize.literal('GETDATE()') : new Date();
      
      await approval.update({
        approver_nik: approverNik,
        status: 'rejected',
        notes: notes || `Rejected by ${approverNik}`,
        updated_at: now
      }, { transaction: transactionArg });

      if (!transaction) {
        await transactionArg.commit();
      }

      return {
        success: true,
        data: {
          approval_id,
          status: 'rejected',
          message: 'Approval ditolak'
        }
      };
    } catch (error) {
      if (!transaction) {
        await transactionArg.rollback();
      }
      throw handleServiceError(error, 'Gagal reject approval');
    }
  }
}

export default ApprovalService;

