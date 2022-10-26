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

// const db = new Sequelize(DB_NAME, USER, PASS, {
//   host: HOST,
//   dialect: "mssql",
//   logging: false,
//   // timezone: "+07:00",
//   dialectOptions: {
//     // timezone: "local",
//     encrypt: true,
//     cryptoCredentialsDetails: {
//       minVersion: "TLSv1",
//     },
//   },
// });
// const db = new Sequelize("DBSPM", "sa", "Asd321`", {
//   host: "localhost",
//   dialect: "mssql",
//   timezone: "+07:00",
//   logging: false,
//   dialectOptions: {
//     timezone: "local",
//     options: {
//       encrypt: false,
//       enableArithAbort: false,
//     },
//   },
// });
const db = new Sequelize("NewWipOne", "sa", "Admin12345", {
  host: "192.168.2.225",
  dialect: "mssql",
  timezone: "+07:00",
  logging: false,
  dialectOptions: {
    timezone: "local",
    options: {
      encrypt: false,
      enableArithAbort: false,
    },
  },
});
// const db = new Sequelize("NewWipOne", "Sumbiri", "Sbrsmg123$$!!", {
//   host: "192.168.0.110",
//   dialect: "mssql",
//   dialectOptions: {
//     options: {
//       encrypt: false,
//       enableArithAbort: false,
//     },
//   },
// });
// const db = new Sequelize("db_sumbiri_one", "egi", "Asd54321`", {
//   host: "192.168.2.82",
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });

export default db;
