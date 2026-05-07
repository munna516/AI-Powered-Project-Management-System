function getByPath(obj, path) {
  if (!path) return undefined;
  const parts = String(path).split(".").filter(Boolean);
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function toCsvCell(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  const str = typeof value === "string" ? value : JSON.stringify(value);
  const needsQuotes = /[",\n\r]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function buildColumns(rows, columns) {
  if (Array.isArray(columns) && columns.length > 0) return columns;
  const keySet = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    Object.keys(row).forEach((k) => keySet.add(k));
  }
  return Array.from(keySet).map((key) => ({ header: key, key }));
}

function resolveValue(row, col) {
  if (typeof col?.value === "function") return col.value(row);
  if (typeof col?.key === "function") return col.key(row);
  if (typeof col?.key === "string") return getByPath(row, col.key);
  if (typeof col === "string") return getByPath(row, col);
  return "";
}

export function rowsToCsv(rows, columns) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const cols = buildColumns(safeRows, columns);
  const headerRow = cols.map((c) => toCsvCell(c.header ?? c.key ?? "")).join(",");
  const dataRows = safeRows.map((row) =>
    cols.map((c) => toCsvCell(resolveValue(row, c))).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

export function downloadCsv({ rows, filename = "export.csv", columns }) {
  const csv = rowsToCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

