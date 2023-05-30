import dotenv from "dotenv";
import tedious from "tedious";
dotenv.config();
import { Sequelize } from "sequelize";
const { DB_NAME, HOST, USER, PASS } = process.env;
tedious.Connection;

// const db = new Sequelize(DB_NAME, USER, PASS, {
//   host: HOST,
//   port: 44170,
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });
// const db = new Sequelize("db_sumbiri_one", "root", "", {
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
//   pool: {
//     max: 30,
//     min: 0,
//     acquire: 60000,
//     idle: 5000,
//   },
// });

const db = new Sequelize("db_sumbiri_one", "sumbirispm", "Asd54321`", {
  host: "192.168.1.168",
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

// const db = new Sequelize("db_sumbiri_one", "sumbirispm", "Asd54321`", {
//   host: "123.255.200.62",
//   port: "44170",
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });

export default db;
