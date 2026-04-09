"use strict";

const express = require("express");

const synology = require("./synology");
const { renderIndexHtml } = require("./render-index");

const createApp = () => {
  const app = express();

  /** Legacy: GET /download?name= — sama dengan GET /:filename */
  app.get("/download", async (req, res) => {
    const raw = req.query.name;
    const filename =
      typeof raw === "string"
        ? raw.trim()
        : Array.isArray(raw)
        ? String(raw[0])
        : "";
    if (!synology.isSafeListingFilename(filename)) {
      res
        .status(400)
        .type("text/plain")
        .send("Query ?name= nama file tidak valid");
      return;
    }
    await synology.respondWithSynologyFile(filename, res);
  });

  app.get("/", async (_req, res) => {
    try {
      const raw = await synology.fetchSynologyJson(synology.listUrl());
      const { entries } = synology.normalizeListPayload(
        raw && typeof raw === "object" && raw.data !== undefined
          ? raw.data
          : raw
      );
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(renderIndexHtml(entries, null));
    } catch (e) {
      res.status(502).setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(
        renderIndexHtml(
          [],
          e.message ||
            "Gagal menghubungi API Synology. Periksa SYNOLOGY_BASE_URL dan jaringan."
        )
      );
    }
  });

  app.get("/latest.yml", async (_req, res) => {
    try {
      const { body, contentType } = await synology.fetchLatestYmlContent();
      res.setHeader("Content-Type", contentType || "text/yaml; charset=utf-8");
      res.send(body);
    } catch (e) {
      res
        .status(502)
        .type("text/plain")
        .send(e.message || String(e));
    }
  });

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  /** GET /:filename — unduhan langsung di root (untuk URL di latest.yml / auto-update) */
  app.get("/:filename", async (req, res) => {
    const filename = req.params.filename;
    if (!synology.isSafeListingFilename(filename)) {
      res.status(400).type("text/plain").send("Nama file tidak valid");
      return;
    }
    await synology.respondWithSynologyFile(filename, res);
  });

  return app;
};

module.exports = { createApp };
