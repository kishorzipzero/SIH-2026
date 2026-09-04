export type FontSizeVerdict = "pass" | "fail" | "unclear";

export interface FontSizeCheck {
  verdict: FontSizeVerdict;
  ratio: number | null;
  note: string;
}

/**
 * Rule 6 mandates a minimum MRP text height in mm that scales with package size.
 * We cannot measure real-world mm from an uncalibrated phone photo, so this is a
 * *relative* heuristic only: MRP line height vs. the median line height on the
 * same label. It flags obviously undersized MRP text; it cannot certify true
 * mm-level compliance. A production version needs a calibration reference
 * (e.g. a coin or ruler placed in frame) to convert pixel height to mm.
 */
export function checkMrpFontSize(
  mrpLineHeight: number | null,
  medianLineHeight: number
): FontSizeCheck {
  if (mrpLineHeight === null || medianLineHeight <= 0) {
    return {
      verdict: "unclear",
      ratio: null,
      note: "Could not compare MRP text size — MRP line or label baseline not detected.",
    };
  }

  const ratio = mrpLineHeight / medianLineHeight;

  if (ratio < 0.75) {
    return {
      verdict: "fail",
      ratio,
      note: `MRP text is noticeably smaller than the rest of the label (≈${ratio.toFixed(
        2
      )}x median line height). Heuristic only — not an mm measurement.`,
    };
  }

  return {
    verdict: "pass",
    ratio,
    note: `MRP text is at least as prominent as other label text (≈${ratio.toFixed(
      2
    )}x median line height). Heuristic only — does not certify the mm minimum required by Rule 6; use a calibration reference for that.`,
  };
}
