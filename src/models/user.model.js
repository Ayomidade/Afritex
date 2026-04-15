import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // lastName: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      // defaultValue: "user",
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ✅ password reset fields
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    portfolio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    savedProducts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    }, // changed: add savedProducts for dashboard UI
    stats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0,
        activeOrders: 0,
        pendingOrders: 0,
        countriesShopped: 0,
        designersSupported: 0,
      },
    },
  },
  { tableName: "users", timestamps: true },
);

export default User;
