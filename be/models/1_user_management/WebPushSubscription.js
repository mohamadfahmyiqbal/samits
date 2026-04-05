import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const WebPushSubscription = sequelize.define('WebPushSubscription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    endpointHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    p256dh: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    auth: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contentEncoding: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userNik: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    userPosition: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rawSubscription: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'webPushSubscriptions',
    timestamps: false
  });

  WebPushSubscription.associate = () => {};

  return WebPushSubscription;
};
