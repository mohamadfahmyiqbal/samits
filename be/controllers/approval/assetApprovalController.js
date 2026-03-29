/* be/controllers/approval/assetApprovalController.js
* Controllers untuk Asset Approval Flow
* Standard response format + error handling
*/

import ApprovalService from '../../services/approval.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

const standardizeResponse = (data) => data;

export const createAssetApprovalRequest = async (req, res) => {
  try {
    const { noAsset } = req.params;
    const requesterNik = req.user?.nik;
    
    if (!requesterNik) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    const result = await ApprovalService.createApprovalRequest(noAsset, 'asset', requesterNik);
    return res.status(201).json(result);
  } catch (error) {
    console.error('[ASSET APPROVAL CREATE] Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAssetApprovalStatus = async (req, res) => {
  try {
    const { noAsset } = req.params;
    const result = await ApprovalService.getApprovalStatus(noAsset, 'asset');
    return res.status(200).json(result);
  } catch (error) {
    console.error('[ASSET APPROVAL STATUS] Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const approveAssetApproval = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const approverNik = req.user?.nik;
    const { notes, next_level_id } = req.body;
    
    if (!approverNik) {
      return res.status(401).json({
        success: false,
        message: 'Approver tidak terautentikasi'
      });
    }

    const result = await ApprovalService.approveStep(approvalId, approverNik, notes, next_level_id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[ASSET APPROVAL APPROVE] Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const rejectAssetApproval = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const approverNik = req.user?.nik;
    const { notes } = req.body;
    
    if (!approverNik) {
      return res.status(401).json({
        success: false,
        message: 'Approver tidak terautentikasi'
      });
    }

    const result = await ApprovalService.rejectStep(approvalId, approverNik, notes);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[ASSET APPROVAL REJECT] Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

