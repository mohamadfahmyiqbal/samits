import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const IssueOrderDetail = sequelize.define('IssueOrderDetail', {
    order_detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    account_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    budget_timing: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    budget_amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    purchase_timing: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    purchase_amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    is_sold_to_customer: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    sold_amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    profit_ratio: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    }
  }, {
    tableName: 'issue_order_details',
    timestamps: false
  });

  return IssueOrderDetail;
};

