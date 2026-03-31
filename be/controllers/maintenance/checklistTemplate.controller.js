import { maintenanceChecklistTemplateService } from '../../services/maintenanceChecklistTemplate.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

export const listTemplates = async (req, res) => {
  try {
    const result = await maintenanceChecklistTemplateService.listBySubCategory(
      req.query.sub_category,
    );
    res.status(200).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const createTemplate = async (req, res) => {
  try {
    const payload = {
      sub_category: req.body.sub_category,
      template_label: req.body.template_label,
      description: req.body.description,
    };
    const result = await maintenanceChecklistTemplateService.create(payload);
    res.status(201).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};
