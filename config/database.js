import dotenv from "dotenv";
import tedious from "tedious";
dotenv.config();
import { Sequelize } from "sequelize";
const { DB_NAME, HOST, USER, PASS } = process.env;
tedious.Connection;

// const db = new Sequelize("db_sumbiri_one", "root", "", {
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });

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
