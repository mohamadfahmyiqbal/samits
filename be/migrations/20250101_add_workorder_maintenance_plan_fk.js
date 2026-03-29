import { DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface) => {
    // Add FK maintenance_plan_id ke WorkOrder
    await queryInterface.addColumn('work_orders', 'maintenance_plan_id', {
      type: DataTypes.INTEGER,
      references: {
        model: 'maintenance_plans',
        key: 'plan_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // Add index untuk fast lookup
    await queryInterface.addIndex('work_orders', ['maintenance_plan_id']);
    
    // Add notification_sent flag
    await queryInterface.addColumn('work_orders', 'notification_sent', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Add trigger AFTER INSERT MaintenancePlan → auto WO
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_auto_workorder_after_maintenance_plan_insert
      ON maintenance_plans
      AFTER INSERT
      AS
      BEGIN
        DECLARE @planId INT, @pic NVARCHAR(255), @itItemId NVARCHAR(50);
        
        SELECT @planId = INSERTED.plan_id, 
               @pic = INSERTED.pic,
               @itItemId = INSERTED.it_item_id
        FROM INSERTED;
        
        -- Parse PIC dan create WO (simplified - full logic di service)
        IF @pic IS NOT NULL AND LEN(@pic) > 0
        BEGIN
          -- Call Node.js service via extended proc (alternative: scheduled job)
          EXEC dbo.sp_create_workorder_from_plan @planId, @pic, @itItemId;
        END
      END
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('work_orders', 'notification_sent');
    await queryInterface.removeColumn('work_orders', 'maintenance_plan_id');
    await queryInterface.sequelize.query('DROP TRIGGER trg_auto_workorder_after_maintenance_plan_insert');
  }
};

