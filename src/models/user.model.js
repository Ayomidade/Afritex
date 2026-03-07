
import { DataTypes } from "sequelize";
import sequelize from "./src/MySql/config/db.js";



const User = sequelize.define(
  'User',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName:{
      type: DataTypes.STRING,
      allowNull: false
    },
    email:{
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phoneNumber:{
       type: DataTypes.INTEGER,
       allowNull: false
    },
    role:{
        type: DataTypes.ENUM('customer', 'designer', 'admin'),
        allowNull: false
    }
  },
);

export default User;