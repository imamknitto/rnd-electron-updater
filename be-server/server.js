"use strict";

const config = require("./lib/config");
const { createApp } = require("./lib/app");
const { listUrl } = require("./lib/synology");

const app = createApp();

app.listen(config.PORT, () => {
  process.stdout.write(`Server http://localhost:${config.PORT}\n`);
  process.stdout.write(`Listing: ${listUrl()}\n`);
});
