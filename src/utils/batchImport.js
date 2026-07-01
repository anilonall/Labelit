const FIELD_ALIASES = {
  sendername: "senderName",
  sender: "senderName",
  sendercompany: "senderName",
  senderaddress: "senderAddress",
  senderaddr: "senderAddress",
  recipientname: "recipientName",
  recipient: "recipientName",
  customername: "recipientName",
  customer: "recipientName",
  recipientaddress: "recipientAddress",
  recipientaddr: "recipientAddress",
  address: "recipientAddress",
  orderno: "orderNo",
  ordernumber: "orderNo",
  orderid: "orderNo",
  siparisno: "orderNo",
  siparisnumarasi: "orderNo",
  referans: "reference",
  reference: "reference",
  referenceno: "reference",
  trackingno: "reference",
  trackingnumber: "reference",
  weight: "weightValue",
  weightvalue: "weightValue",
  agirlik: "weightValue",
  weightunit: "weightUnit",
  agirlikbirimi: "weightUnit",
  distance: "distanceValue",
  distancevalue: "distanceValue",
  mesafe: "distanceValue",
  distanceunit: "distanceUnit",
  mesafebirimi: "distanceUnit",
  deliverytime: "deliveryTime",
  teslimatzamani: "deliveryTime",
  deliverytype: "deliveryType",
  teslimattipi: "deliveryType",
  deliverywindow: "deliveryWindow",
  teslimatsuresi: "deliveryWindow",
  barcode: "barcodeText",
  barcodetext: "barcodeText",
  barkod: "barcodeText",
  qrcode: "barcodeText",
  note: "note",
  notes: "note",
  teslimatnotu: "note"
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseDelimitedText(text, delimiter) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(current);
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some(cell => String(cell).trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some(cell => String(cell).trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function detectDelimiter(text) {
  const firstLine = String(text || "").split(/\r?\n/, 1)[0] || "";
  const candidates = [",", ";", "\t"];
  let winner = ",";
  let bestScore = -1;

  candidates.forEach(candidate => {
    const score = firstLine.split(candidate).length;
    if (score > bestScore) {
      bestScore = score;
      winner = candidate;
    }
  });

  return winner;
}

function sanitizeValue(value) {
  const text = String(value ?? "").trim();
  return text;
}

function buildCustomField(column, value, rowIndex) {
  return {
    id: `imported-${rowIndex}-${normalizeHeader(column) || "field"}`,
    label: String(column || "Field").trim(),
    value,
    visible: true,
    sourceType: "manual"
  };
}

function mapRowToRecord(row, headers, rowIndex) {
  const fields = {};
  const customFields = [];

  headers.forEach((header, columnIndex) => {
    const rawValue = sanitizeValue(row[columnIndex]);
    if (!rawValue) {
      return;
    }

    const normalizedHeader = normalizeHeader(header);
    const targetKey = FIELD_ALIASES[normalizedHeader];

    if (targetKey) {
      fields[targetKey] = rawValue;
      return;
    }

    customFields.push(buildCustomField(header, rawValue, rowIndex));
  });

  if (!fields.barcodeText) {
    fields.barcodeText = fields.orderNo || fields.reference || "";
  }

  const title = fields.orderNo || fields.barcodeText || fields.recipientName || `Record ${rowIndex + 1}`;

  return {
    id: `record-${rowIndex + 1}`,
    title,
    fields,
    customFields,
    raw: Object.fromEntries(headers.map((header, columnIndex) => [header, sanitizeValue(row[columnIndex])]))
  };
}

function parseJsonRecords(text) {
  const data = JSON.parse(text);
  const rows = Array.isArray(data) ? data : Array.isArray(data.records) ? data.records : [];

  if (!rows.length) {
    return [];
  }

  const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
  return rows.map((row, rowIndex) => mapRowToRecord(headers.map(header => row?.[header] ?? ""), headers, rowIndex));
}

export function parseBatchText(text, fileName = "") {
  const lowerName = String(fileName || "").toLowerCase();
  if (lowerName.endsWith(".json")) {
    return parseJsonRecords(text);
  }

  const delimiter = lowerName.endsWith(".tsv") ? "\t" : detectDelimiter(text);
  const rows = parseDelimitedText(text, delimiter);

  if (rows.length < 2) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((row, rowIndex) => mapRowToRecord(row, headers, rowIndex));
}

export function removeImportedCustomFields(customFields = []) {
  return customFields.filter(field => !String(field?.id || "").startsWith("imported-"));
}
