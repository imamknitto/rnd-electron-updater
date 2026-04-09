"use strict";

const config = require("./config");

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatApacheDate = (d) => {
  if (!d) return "-";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  const mon = months[d.getMonth()];
  const y = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${mon}-${y} ${hh}:${mm}`;
};

const formatSize = (isDir, size) => {
  if (isDir) return "-";
  if (size == null || size < 0) return "-";
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}k`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}M`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)}G`;
};

/**
 * @param {Array<{ name: string, isDir: boolean, size: number | null, mtime: Date | null, perm: string }>} entries
 * @param {string | null} errorMessage
 */
const renderIndexHtml = (entries, errorMessage) => {
  const rows = errorMessage
    ? `<tr><td colspan="5" style="color:#b00;padding:8px">${escapeHtml(
        errorMessage
      )}</td></tr>`
    : entries
        .map((e) => {
          const href = e.isDir
            ? `${encodeURIComponent(e.name)}/`
            : e.name === "latest.yml"
            ? "/latest.yml"
            : `/${encodeURIComponent(e.name)}`;
          const icon = e.isDir ? "📁" : "📄";
          return `<tr>
  <td style="width:24px">${icon}</td>
  <td><tt>${escapeHtml(e.perm)}</tt></td>
  <td><tt>${escapeHtml(formatApacheDate(e.mtime))}</tt></td>
  <td align="right"><tt>${escapeHtml(formatSize(e.isDir, e.size))}</tt></td>
  <td><a href="${escapeHtml(href)}">${escapeHtml(e.name)}</a>${
            e.isDir ? "/" : ""
          }</td>
</tr>`;
        })
        .join("\n");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Index of /</title>
<style>
  body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; margin: 16px; }
  h1 { font-size: 1.25rem; font-weight: bold; }
  table { border-spacing: 0; width: 100%; max-width: 900px; }
  th, td { padding: 2px 12px 2px 0; vertical-align: top; }
  th { text-align: left; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
  a { color: #00e; }
  .foot { margin-top: 24px; color: #666; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>Index of /</h1>
<table>
<thead>
<tr><th></th><th>Permissions</th><th>Date</th><th align="right">Size</th><th>Name</th></tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
<p class="foot">Node.js ${escapeHtml(
    process.version
  )}/ Express server running @ localhost:${config.PORT}</p>
</body>
</html>`;
};

module.exports = { renderIndexHtml };
