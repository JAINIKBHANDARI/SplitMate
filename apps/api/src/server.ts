import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import mongoose from "mongoose";

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () =>
    console.info(`SplitMate API listening on :${env.PORT}`),
  );
  const shutdown = async (signal: string) => {
    console.info(`${signal} received. Closing SplitMate API.`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
start().catch((error) => {
  console.error("Unable to start SplitMate", error);
  process.exit(1);
});
