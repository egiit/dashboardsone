import express from "express";
import dotenv from "dotenv";
import db from "./config/database.js";

dotenv.config();
import cookieParser from "cookie-parser";
// import FileUpload from "express-fileupload";
import cors from "cors";

import sumbiriOneRoute from "./routes/index.js";

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

// app.use(cors());

var whitelist = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://192.168.3.7:3000",
  "https://192.168.3.6:3000",
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
      } else if (express.static("public")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(cookieParser());
// app.use(express.json());
app.use(express.json({ limit: "5mb" }));

app.use("/", sumbiriOneRoute);

app.listen(PORT, () => console.log(`Server Runing On port : ${PORT}`));
