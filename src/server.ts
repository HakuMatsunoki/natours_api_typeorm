import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
  console.log("==============> Uncaught exception", err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

import app from "./app.js";
import { serverConfigs } from "./configs";

// SERVER
const server = app.listen(serverConfigs.PORT, () => {
  console.log(`App running on port ${serverConfigs.PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("===========> unhandled rejection", err);

  server.close(() => {
    process.exit(1);
  });
});

// HEROKU
process.on("SIGTERM", (err) => {
  console.log("=======> SIGTERM received, shutting down...", err);
  server.close(() => {
    console.log("=========> process terminated.");
  });
});
