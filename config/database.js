import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

const db = new Sequelize("db_sumbiri_one", "egi", "Asd54321`", {
  host: "192.168.2.82",
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

export default db;
