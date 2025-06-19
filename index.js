import cron from "node-cron";
import accessWeb from "./access-web.js";

cron.schedule("*/10 * * * *", () => {
  console.log("running a task every 10 minutes");
  accessWeb();
});
