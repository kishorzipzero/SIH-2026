import { createWorker, Worker } from "tesseract.js";

export interface OcrLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  height: number;
}

export interface OcrResult {
  fullText: string;
  lines: OcrLine[];
  meanConfidence: number;
  medianLineHeight: number;
}

let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng+hin");
  }
  return workerPromise;
}

export async function extractText(imagePath: string): Promise<OcrResult> {
  const worker = await getWorker();
  const { data } = await worker.recognize(imagePath);

  const rawLines = (data.lines ?? []) as Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;

  const lines: OcrLine[] = rawLines
    .map((l) => ({
      text: l.text.trim(),
      confidence: l.confidence,
      bbox: l.bbox,
      height: Math.max(1, l.bbox.y1 - l.bbox.y0),
    }))
    .filter((l) => l.text.length > 0);

  const meanConfidence = lines.length
    ? lines.reduce((sum, l) => sum + l.confidence, 0) / lines.length
    : data.confidence ?? 0;

  const heights = lines.map((l) => l.height).sort((a, b) => a - b);
  const medianLineHeight = heights.length
    ? heights[Math.floor(heights.length / 2)]
    : 0;

  return { fullText: data.text, lines, meanConfidence, medianLineHeight };
}

export async function shutdownOcr(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
