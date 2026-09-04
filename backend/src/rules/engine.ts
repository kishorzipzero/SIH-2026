import { OcrResult } from "../ocr/extractText";
import { CHECKLIST } from "./checklist";
import { checkMrpFontSize } from "./fontSizeHeuristic";
import { CheckStatus, FieldResult, ProductContext } from "./types";

/** Below this mean OCR confidence, an unmatched field is reported "unclear"
 *  rather than "fail" — we can't tell whether it's genuinely missing or the
 *  scan was just too poor to read it. */
const LOW_CONFIDENCE_THRESHOLD = 55;
/** A field that *is* matched but on a very low-confidence line is still
 *  reported "unclear" rather than a confident pass. */
const MATCH_CONFIDENCE_FLOOR = 45;

export interface ComplianceReport {
  overallConfidence: number;
  fields: FieldResult[];
  summary: { pass: number; fail: number; unclear: number; notApplicable: number };
}

export function runComplianceCheck(
  ocr: OcrResult,
  ctx: ProductContext
): ComplianceReport {
  const fields: FieldResult[] = CHECKLIST.map((item) => {
    const applicable = item.appliesTo(ctx);
    if (!applicable) {
      return {
        id: item.id,
        label: item.label,
        clauseRef: item.clauseRef,
        applicable: false,
        status: "pass" as CheckStatus,
        extractedValue: null,
        confidence: null,
        note: "Not applicable to this product category/origin.",
      };
    }

    const match = item.match(ocr);
    let status: CheckStatus;
    let note = match.note;

    if (match.value === null) {
      status = ocr.meanConfidence < LOW_CONFIDENCE_THRESHOLD ? "unclear" : "fail";
      if (status === "unclear") {
        note = note ?? "Scan quality too low to confirm this field is absent.";
      }
    } else if (match.confidence !== null && match.confidence < MATCH_CONFIDENCE_FLOOR) {
      status = "unclear";
      note = note ?? "Matched text but OCR confidence was too low to trust it.";
    } else {
      status = "pass";
    }

    // Special-case: MRP also gets the font-size heuristic layered on top.
    if (item.id === "mrp" && status === "pass") {
      const fontCheck = checkMrpFontSize(match.lineHeight, ocr.medianLineHeight);
      if (fontCheck.verdict !== "pass") {
        status = fontCheck.verdict;
      }
      note = note ? `${note} ${fontCheck.note}` : fontCheck.note;
    }

    return {
      id: item.id,
      label: item.label,
      clauseRef: item.clauseRef,
      applicable: true,
      status,
      extractedValue: match.value,
      confidence: match.confidence,
      note,
    };
  });

  const summary = fields.reduce(
    (acc, f) => {
      if (!f.applicable) acc.notApplicable += 1;
      else if (f.status === "pass") acc.pass += 1;
      else if (f.status === "fail") acc.fail += 1;
      else acc.unclear += 1;
      return acc;
    },
    { pass: 0, fail: 0, unclear: 0, notApplicable: 0 }
  );

  return { overallConfidence: ocr.meanConfidence, fields, summary };
}
