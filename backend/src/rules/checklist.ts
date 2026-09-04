import { OcrLine, OcrResult } from "../ocr/extractText";
import { ProductContext } from "./types";

export interface MatchOutcome {
  value: string | null;
  confidence: number | null;
  lineHeight: number | null;
  note?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  /**
   * Indicative mapping to Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6.
   * Sub-clause lettering here is a working reference for MVP triage, not a certified
   * legal citation — verify exact sub-clause text against the official Gazette
   * notification before relying on it for enforcement or legal filings.
   */
  clauseRef: string;
  appliesTo: (ctx: ProductContext) => boolean;
  match: (ocr: OcrResult) => MatchOutcome;
}

function findLineMatch(lines: OcrLine[], regex: RegExp): MatchOutcome {
  for (const line of lines) {
    const m = line.text.match(regex);
    if (m) {
      return {
        value: m[0].trim(),
        confidence: line.confidence,
        lineHeight: line.height,
      };
    }
  }
  return { value: null, confidence: null, lineHeight: null };
}

const NET_QTY_RE =
  /\b(net\s*(wt|weight|qty|quantity)?\s*[:\-]?\s*\d+(\.\d+)?\s*(g|gm|gms|kg|ml|l|ltr|litre|litres|pcs|pieces|n)\b)/i;

const MFG_DATE_RE =
  /\b(mfg|manufactured|packed|pkd|mfd|pkg)\.?[^\d]{0,15}(\d{1,2}[\/\-]\d{2,4}|[a-z]{3,9}\.?\s?\d{2,4})/i;

const MRP_RE =
  /\b(mrp|m\.r\.p\.?|max(imum)?\s*retail\s*price)[^\d₹]{0,12}(₹|rs\.?|inr)?\s?\d+(\.\d{1,2})?/i;

const CONSUMER_CARE_RE =
  /(consumer care|customer care|toll[\s-]?free|contact us|for complaints)/i;
const PHONE_RE = /(\+?91[-\s]?)?\b\d{10}\b/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;

const MANUFACTURER_RE =
  /(mfg\.?\s*by|manufactured\s*by|marketed\s*by|packed\s*by|packer\s*:|imported\s*by)/i;

const COUNTRY_OF_ORIGIN_RE = /country\s*of\s*origin\s*[:\-]?\s*([a-z ]{3,30})/i;

const BEST_BEFORE_RE =
  /\b(best\s*before|use\s*by|expiry|exp\.?)\b[^\d]{0,15}(\d{1,2}[\/\-]\d{2,4}|[a-z]{3,9}\.?\s?\d{2,4})/i;

const UNIT_SALE_PRICE_RE =
  /(unit sale price|price per (kg|litre|liter|100\s?g|100\s?ml))/i;

export const CHECKLIST: ChecklistItem[] = [
  {
    id: "manufacturer_details",
    label: "Manufacturer / Packer / Importer Name & Address",
    clauseRef: "Rule 6(1)(a) [indicative]",
    appliesTo: () => true,
    match: (ocr) => findLineMatch(ocr.lines, MANUFACTURER_RE),
  },
  {
    id: "common_name",
    label: "Common / Generic Name of Commodity",
    clauseRef: "Rule 6(1)(b) [indicative]",
    appliesTo: () => true,
    match: (ocr) => {
      // Generic-name detection from OCR text alone is unreliable without product
      // context, so this check is conservative: it always needs a human sanity
      // check rather than silently asserting a pass.
      const firstLine = ocr.lines[0];
      if (!firstLine) return { value: null, confidence: null, lineHeight: null };
      return {
        value: firstLine.text,
        confidence: firstLine.confidence,
        lineHeight: firstLine.height,
        note: "Best-guess from the most prominent label text — confirm manually.",
      };
    },
  },
  {
    id: "net_quantity",
    label: "Net Quantity (standard unit of weight/measure/number)",
    clauseRef: "Rule 6(1)(c) [indicative]",
    appliesTo: () => true,
    match: (ocr) => findLineMatch(ocr.lines, NET_QTY_RE),
  },
  {
    id: "mfg_date",
    label: "Month & Year of Manufacture / Pre-Packing / Import",
    clauseRef: "Rule 6(1)(d) [indicative]",
    appliesTo: () => true,
    match: (ocr) => findLineMatch(ocr.lines, MFG_DATE_RE),
  },
  {
    id: "mrp",
    label: "MRP (inclusive of all taxes)",
    clauseRef: "Rule 6(1)(e) [indicative]",
    appliesTo: () => true,
    match: (ocr) => findLineMatch(ocr.lines, MRP_RE),
  },
  {
    id: "consumer_care",
    label: "Consumer Care Name, Address & Contact",
    clauseRef: "Rule 6(1)(f) [indicative]",
    appliesTo: () => true,
    match: (ocr) => {
      const byKeyword = findLineMatch(ocr.lines, CONSUMER_CARE_RE);
      if (byKeyword.value) return byKeyword;
      const byPhone = findLineMatch(ocr.lines, PHONE_RE);
      if (byPhone.value) return byPhone;
      return findLineMatch(ocr.lines, EMAIL_RE);
    },
  },
  {
    id: "country_of_origin",
    label: "Country of Origin",
    clauseRef: "Rule 6 proviso (imported goods) [indicative]",
    appliesTo: (ctx) => ctx.origin === "imported",
    match: (ocr) => findLineMatch(ocr.lines, COUNTRY_OF_ORIGIN_RE),
  },
  {
    id: "best_before",
    label: "Best Before / Use-By Date",
    clauseRef: "Rule 6(1) read with FSS Labelling Regulations (food) [indicative]",
    appliesTo: (ctx) => ctx.perishable,
    match: (ocr) => findLineMatch(ocr.lines, BEST_BEFORE_RE),
  },
  {
    id: "unit_sale_price",
    label: "Unit Sale Price (loose-equivalent pricing)",
    clauseRef: "Rule 6(1) [indicative]",
    appliesTo: (ctx) => ctx.hasUnitSalePrice,
    match: (ocr) => findLineMatch(ocr.lines, UNIT_SALE_PRICE_RE),
  },
];
