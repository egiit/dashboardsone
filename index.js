import express from "express";
import dotenv from "dotenv";
import db from "./config/database.js";

dotenv.config();
import cookieParser from "cookie-parser";
import FileUpload from "express-fileupload";
import cors from "cors";
import cron from "node-cron";

import sumbiriOneRoute from "./routes/index.js";
import { funcReschedule } from "./cronjob/cronSchdVsActual.js";
import { cronLogDialyOut } from "./cronjob/logDailyOutput.js";

// import fs from "fs"; //untuk ssl
// import https from "https"; //untuk ssl
// import bodyParser from 'body-parser';

const PORT = 5001;
const app = express();

const runDb = async () => {
  try {
    await db.authenticate();
    console.log("DB Connected");
  } catch (err) {
    console.log("Unable to connect to the database SPM:", err);
  }
};

runDb();

// cron.schedule(" 1 1 * * *", () => {
//   console.log("running a task reschedule");
//   funcReschedule();
// });

// cron.schedule(" 1 * * * * *", () => {
//   console.log("running a task log");
//   cronLogDialyOut();
// });
// app.use(cors());

function logOriginalUrl(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  next();
}

var whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://spmqc.sumbiri.com",
  "https://spm.sumbiri.com",
  "https://api.sumbiri.com",
];

// const options = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };
app.use(express.static("public"));

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else if (whitelist.indexOf(origin) !== -1 && express.static("public")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(cookieParser());
// app.use(express.json());
app.use(express.json({ limit: "45mb" }));
app.use(FileUpload());

app.use("/", sumbiriOneRoute);

app.listen(PORT, () => console.log(`Server Runing On port : ${PORT}`));
