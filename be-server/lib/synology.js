"use strict";

const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

const config = require("./config");

const synologyJsonHeaders = () => {
  const h = { Accept: "application/json" };
  if (config.API_TOKEN) h.Authorization = `Bearer ${config.API_TOKEN}`;
  return h;
};

const listQuery = () => {
  const p = new URLSearchParams();
  p.set("type", "all");
  p.set("folder_path", config.FOLDER_PATH);
  p.set("base", config.BASE_VOLUME);
  return p.toString();
};

const listUrl = () =>
  `${config.SYNOLOGY_BASE_URL}/directory/lists?${listQuery()}`;

/** GET …/directory/{folder…}/{filename}/download?base=… */
const buildFileDownloadUrl = (filename) => {
  const folderSegs = config.FOLDER_PATH.split("/").filter(Boolean);
  const pathParts = [...folderSegs, filename].map(encodeURIComponent).join("/");
  const q = new URLSearchParams();
  q.set("base", config.BASE_VOLUME);
  return `${
    config.SYNOLOGY_BASE_URL
  }/directory/${pathParts}/download?${q.toString()}`;
};

const isSafeListingFilename = (name) => {
  if (!name || typeof name !== "string") return false;
  if (name.includes("/") || name.includes("\\")) return false;
  if (name.includes("..") || name === "." || name === "..") return false;
  return true;
};

/**
 * Normalisasi berbagai bentuk respons API Synology/custom ke { entries: Entry[] }
 * @typedef {{ name: string, isDir: boolean, size: number | null, mtime: Date | null, perm: string }} Entry
 */
const normalizeListPayload = (data) => {
  const entries = [];

  const push = (raw) => {
    if (!raw || typeof raw !== "object") return;
    const name =
      raw.name ??
      raw.filename ??
      raw.file ??
      raw.path?.split?.("/")?.pop?.() ??
      raw.title;
    if (!name || typeof name !== "string") return;

    const isDir = Boolean(
      raw.isdir ??
        raw.is_dir ??
        raw.dir ??
        (raw.type && String(raw.type).toLowerCase() === "dir") ??
        (raw.filetype && String(raw.filetype).toLowerCase() === "folder")
    );

    let size = null;
    if (raw.size != null) size = Number(raw.size);
    else if (raw.filesize != null) size = Number(raw.filesize);
    if (Number.isNaN(size)) size = null;

    let mtime = null;
    const mt =
      raw.mtime ?? raw.mtime_ms ?? raw.modified ?? raw.time ?? raw.date;
    if (mt != null) {
      const d = new Date(typeof mt === "number" && mt < 1e13 ? mt * 1000 : mt);
      mtime = Number.isNaN(d.getTime()) ? null : d;
    }

    const perm =
      raw.perm ??
      raw.permission ??
      raw.mode ??
      (isDir ? "drw-rw-rw-" : "-rw-rw-rw-");

    entries.push({ name, isDir, size, mtime, perm: String(perm) });
  };

  if (Array.isArray(data)) {
    data.forEach(push);
  } else if (data && typeof data === "object") {
    const res = data.result;
    if (res && typeof res === "object" && !Array.isArray(res)) {
      if (Array.isArray(res.folders)) res.folders.forEach(push);
      if (Array.isArray(res.files)) res.files.forEach(push);
    }

    const candidates = [
      data.data,
      data.list,
      data.items,
      data.files,
      Array.isArray(data.result) ? data.result : null,
      data.entries,
      data.folders && data.files && [...data.folders, ...data.files],
    ].filter(Boolean);

    for (const c of candidates) {
      if (Array.isArray(c)) {
        c.forEach(push);
        if (entries.length) break;
      }
    }

    if (!entries.length) {
      const dataField = data.data;
      if (
        dataField &&
        typeof dataField === "object" &&
        !Array.isArray(dataField)
      ) {
        Object.keys(dataField).forEach((k) =>
          push({ ...dataField[k], name: dataField[k]?.name ?? k })
        );
      }
    }
  }

  entries.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return { entries };
};

const fetchSynologyJson = async (url) => {
  const res = await fetch(url, {
    headers: synologyJsonHeaders(),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { _raw: text };
  }
  if (!res.ok) {
    const msg =
      data?.message || data?.error || text?.slice(0, 200) || res.statusText;
    const err = new Error(`Synology API ${res.status}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return data;
};

const fileAuthHeaders = () =>
  config.API_TOKEN ? { Authorization: `Bearer ${config.API_TOKEN}` } : {};

/** Isi latest.yml (teks), untuk route preview — bukan stream */
const fetchLatestYmlContent = async () => {
  const fileHeaders = {
    Accept: "text/plain, application/x-yaml, */*",
    ...fileAuthHeaders(),
  };

  if (config.LATEST_YML_OVERRIDE) {
    const res = await fetch(config.LATEST_YML_OVERRIDE, {
      headers: fileHeaders,
    });
    if (!res.ok) {
      throw new Error(
        `Gagal mengambil latest.yml: ${res.status} ${res.statusText}`
      );
    }
    return {
      body: await res.text(),
      contentType: res.headers.get("content-type"),
    };
  }

  const url = buildFileDownloadUrl("latest.yml");
  const res = await fetch(url, { headers: fileHeaders });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Synology download ${res.status}: ${
        text?.slice(0, 200) || res.statusText
      }`
    );
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("json")) {
    try {
      const j = JSON.parse(text);
      if (j && (j.error || j.errmsg)) {
        throw new Error(
          typeof j.message === "string"
            ? j.message
            : "Respons JSON error dari server file"
        );
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        /* teks bukan JSON — lanjut sebagai body yaml */
      } else {
        throw e;
      }
    }
  }

  return {
    body: text,
    contentType: ct.includes("yaml") ? ct : "text/yaml; charset=utf-8",
  };
};

/** Stream unduhan dari Synology ke response Express (cocok untuk .exe besar). */
const proxySynologyFileToResponse = async (filename, res) => {
  const url = buildFileDownloadUrl(filename);
  const syno = await fetch(url, {
    headers: {
      Accept: "*/*",
      ...fileAuthHeaders(),
    },
  });

  if (!syno.ok) {
    const errText = await syno.text();
    const err = new Error(
      `Synology download ${syno.status}: ${
        errText?.slice(0, 300) || syno.statusText
      }`
    );
    err.status = syno.status;
    throw err;
  }

  const ct = syno.headers.get("content-type");
  if (ct) res.setHeader("Content-Type", ct);
  else res.setHeader("Content-Type", "application/octet-stream");

  const cd = syno.headers.get("content-disposition");
  if (cd) {
    res.setHeader("Content-Disposition", cd);
  } else {
    const safe = filename.replace(/[\r\n"]/g, "_");
    res.setHeader("Content-Disposition", `attachment; filename="${safe}"`);
  }

  const len = syno.headers.get("content-length");
  if (len) res.setHeader("Content-Length", len);

  if (!syno.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(syno.body);
  await pipeline(nodeStream, res);
};

const respondWithSynologyFile = async (filename, res) => {
  try {
    await proxySynologyFileToResponse(filename, res);
  } catch (e) {
    const status =
      e.status && Number(e.status) >= 400 && Number(e.status) < 600
        ? e.status
        : 502;
    if (!res.headersSent) {
      res
        .status(status)
        .type("text/plain")
        .send(e.message || String(e));
    }
  }
};

module.exports = {
  listUrl,
  isSafeListingFilename,
  normalizeListPayload,
  fetchSynologyJson,
  fetchLatestYmlContent,
  respondWithSynologyFile,
};
