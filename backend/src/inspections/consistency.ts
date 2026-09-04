import { FieldResult } from "../rules/types";

export interface AngleFields {
  angle: string;
  fields: FieldResult[];
}

export interface FieldDiscrepancy {
  fieldId: string;
  label: string;
  clauseRef: string;
  valuesByAngle: { angle: string; rawValue: string }[];
}

const COMPARABLE_FIELDS = [
  "common_name",
  "net_quantity",
  "mrp",
  "mfg_date",
  "best_before",
  "country_of_origin",
] as const;

const NUMBER_UNIT_RE = /(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|ltr|litre|litres|pcs|pieces|n)?/i;
const NUMBER_RE = /(\d+(?:\.\d{1,2})?)/;
const DATE_RE = /(\d{1,2}[\/\-]\d{2,4}|[a-z]{3,9}\.?\s?\d{2,4})/i;

function normalize(fieldId: string, raw: string): string | null {
  const value = raw.trim();
  switch (fieldId) {
    case "net_quantity": {
      const m = value.match(NUMBER_UNIT_RE);
      if (!m) return null;
      return `${parseFloat(m[1])}${(m[2] || "").toLowerCase().replace(/s$/, "")}`;
    }
    case "mrp": {
      const m = value.match(NUMBER_RE);
      if (!m) return null;
      return parseFloat(m[1]).toFixed(2);
    }
    case "mfg_date":
    case "best_before": {
      const m = value.match(DATE_RE);
      if (!m) return null;
      return m[1].toLowerCase().replace(/\s+/g, "");
    }
    case "country_of_origin": {
      const m = value.match(/country\s*of\s*origin\s*[:\-]?\s*([a-z ]{3,30})/i);
      const text = (m ? m[1] : value).trim().toLowerCase();
      return text.replace(/\s+/g, " ");
    }
    case "common_name":
      return value.trim().toLowerCase().replace(/\s+/g, " ");
    default:
      return value.trim().toLowerCase();
  }
}

/**
 * Compares extracted field values across every angle of the same physical
 * product and flags fields where two or more angles disagree — e.g. Net
 * Quantity reads "200 g" on the front but "180 g" on the back. Only flags
 * fields where at least two angles actually produced a value; fields that
 * simply weren't read on some angles aren't treated as a conflict.
 */
export function findDiscrepancies(angleData: AngleFields[]): FieldDiscrepancy[] {
  const discrepancies: FieldDiscrepancy[] = [];

  for (const fieldId of COMPARABLE_FIELDS) {
    const observations: { angle: string; rawValue: string; comparable: string }[] = [];

    for (const { angle, fields } of angleData) {
      const field = fields.find((f) => f.id === fieldId);
      if (!field || !field.applicable || !field.extractedValue) continue;
      const comparable = normalize(fieldId, field.extractedValue);
      if (comparable) observations.push({ angle, rawValue: field.extractedValue, comparable });
    }

    const distinct = new Set(observations.map((o) => o.comparable));
    if (distinct.size > 1) {
      const sample = angleData[0].fields.find((f) => f.id === fieldId);
      discrepancies.push({
        fieldId,
        label: sample?.label ?? fieldId,
        clauseRef: sample?.clauseRef ?? "",
        valuesByAngle: observations.map((o) => ({ angle: o.angle, rawValue: o.rawValue })),
      });
    }
  }

  return discrepancies;
}
