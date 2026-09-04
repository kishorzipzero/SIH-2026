import sharp from "sharp";

export interface ImageQualityMetrics {
  meanBrightness: number;
  contrast: number;
  width: number;
  height: number;
}

/**
 * Cheap, non-forensic image stats used to flag a side of the package that
 * looks visually inconsistent with the others (very different lighting,
 * washed-out or unusually dark print, oddly low detail). This is a triage
 * signal, not proof of tampering or print-quality non-compliance — always
 * pair it with a human look at the flagged photo.
 */
export async function computeImageQuality(imagePath: string): Promise<ImageQualityMetrics> {
  const image = sharp(imagePath).greyscale();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  const mean = sum / data.length;

  let variance = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i] - mean;
    variance += d * d;
  }
  variance /= data.length;

  return {
    meanBrightness: mean,
    contrast: Math.sqrt(variance),
    width: info.width,
    height: info.height,
  };
}

export interface QualityFlag {
  angle: string;
  reason: string;
}

/**
 * Flags any angle whose brightness/contrast is a clear outlier relative to
 * the rest of the set (>1.6x the group's average deviation from the mean).
 * Needs at least 3 angles to have a meaningful "group" to compare against.
 */
export function flagQualityOutliers(
  metrics: { angle: string; quality: ImageQualityMetrics }[]
): QualityFlag[] {
  if (metrics.length < 3) return [];

  const flags: QualityFlag[] = [];
  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

  const brightnessValues = metrics.map((m) => m.quality.meanBrightness);
  const contrastValues = metrics.map((m) => m.quality.contrast);
  const brightnessAvg = avg(brightnessValues);
  const contrastAvg = avg(contrastValues);
  const brightnessDevAvg = avg(brightnessValues.map((v) => Math.abs(v - brightnessAvg)));
  const contrastDevAvg = avg(contrastValues.map((v) => Math.abs(v - contrastAvg)));

  for (const m of metrics) {
    const brightnessDev = Math.abs(m.quality.meanBrightness - brightnessAvg);
    const contrastDev = Math.abs(m.quality.contrast - contrastAvg);

    if (brightnessDevAvg > 2 && brightnessDev > brightnessDevAvg * 1.6) {
      flags.push({
        angle: m.angle,
        reason: `Noticeably ${
          m.quality.meanBrightness > brightnessAvg ? "brighter" : "darker"
        } than the other sides — check lighting or a washed-out/faded print.`,
      });
    } else if (contrastDevAvg > 2 && contrastDev > contrastDevAvg * 1.6) {
      flags.push({
        angle: m.angle,
        reason: "Noticeably lower print/image contrast than the other sides — possible faded or low-quality print.",
      });
    }
  }

  return flags;
}
