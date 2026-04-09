"use strict";

require("dotenv").config();

const PORT = Number(process.env.PORT) || 8080;
const SYNOLOGY_BASE_URL = (
  process.env.SYNOLOGY_BASE_URL || "http://192.168.20.25:8101"
).replace(/\/$/, "");
const FOLDER_PATH =
  process.env.SYNOLOGY_FOLDER_PATH || "imam/electron-update-server";
const BASE_VOLUME = process.env.SYNOLOGY_BASE_VOLUME || "Public_Holis";
const LATEST_YML_OVERRIDE = process.env.SYNOLOGY_LATEST_YML_URL || "";
const API_TOKEN = process.env.SYNOLOGY_API_TOKEN || "";

module.exports = {
  PORT,
  SYNOLOGY_BASE_URL,
  FOLDER_PATH,
  BASE_VOLUME,
  LATEST_YML_OVERRIDE,
  API_TOKEN,
};
