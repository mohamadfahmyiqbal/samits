// Migration: Allow maintenance_checklists.wo_id to accept NULL (needed for template-only checklist creation)
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    ALTER TABLE maintenance_checklists
    ALTER COLUMN wo_id BIGINT NULL;
  `);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    ALTER TABLE maintenance_checklists
    ALTER COLUMN wo_id BIGINT NOT NULL;
  `);
};
