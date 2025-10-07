// // Class order must match the trained model indices
// export const CLASS_NAMES = [
//   "Clean",
//   "Dirty",
//   "Light_On",
//   "Light_Off",
//   "Soap",
//   "Soap_Dispenser",
//   "Water",
//   "Tap",
// ] as const
// export type ClassName = (typeof CLASS_NAMES)[number]
// export const IDX: Record<ClassName, number> = Object.fromEntries(CLASS_NAMES.map((n, i) => [n, i])) as any

// export type Detection = [classId: number, confidence: number]
// export type Scores = {
//   Cleanliness: number
//   Lighting: number
//   "Soap Dispenser": number
//   "Water Supply": number
//   "Odour Control": number
// }

// const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

// // Aggregate: p_present = 1 - Π(1 - conf_i) over detections for that class
// export function aggregateClassProbs(detections: Detection[], confMin = 0.2) {
//   const byCls = new Map<number, number[]>()
//   for (const [cid, conf] of detections) {
//     const p = Number(conf)
//     if (p >= confMin) {
//       const arr = byCls.get(cid) ?? []
//       arr.push(clamp01(p))
//       byCls.set(cid, arr)
//     }
//   }

//   const agg = new Map<number, number>()
//   for (const [c, ps] of byCls.entries()) {
//     let prod = 1
//     for (const p of ps) prod *= 1 - p
//     agg.set(c, 1 - prod)
//   }
//   return agg
// }

// function getProb(agg: Map<number, number>, name: ClassName) {
//   return Number(agg.get(IDX[name]) ?? 0)
// }

// // Mirrors Python score_categories with same math and rounding
// export function scoreCategories(clsProbs: Map<number, number>, odourGamma = 1.4): Scores {
//   const clean = getProb(clsProbs, "Clean")
//   const dirty = getProb(clsProbs, "Dirty")
//   const light_on = getProb(clsProbs, "Light_On")
//   const soap = getProb(clsProbs, "Soap")
//   const disp = getProb(clsProbs, "Soap_Dispenser")
//   const water = getProb(clsProbs, "Water")
//   const tap = getProb(clsProbs, "Tap")

//   const cleanliness = 100 * ((clean + (1 - dirty)) / 2)
//   const lighting = 100 * light_on
//   const soapDisp = 100 * Math.sqrt(clamp01(disp) * clamp01(soap))
//   const waterSupply = 100 * clamp01(0.6 * tap + 0.4 * water)

//   let odour = 100 * Math.pow(dirty, odourGamma)
//   odour = Math.max(0, Math.min(100, odour))

//   return {
//     Cleanliness: Math.round(cleanliness * 10) / 10,
//     Lighting: Math.round(lighting * 10) / 10,
//     "Soap Dispenser": Math.round(soapDisp * 10) / 10,
//     "Water Supply": Math.round(waterSupply * 10) / 10,
//     "Odour Control": Math.round(odour * 10) / 10,
//   }
// }

// // Replace this with a real detector integration later.
// export async function runModelStub(imageUrl: string): Promise<Detection[]> {
//   // Simple heuristic sample. You can customize based on filename/hints if needed.
//   // Produces higher "Clean", "Light_On", "Tap", moderate "Soap"/"Soap_Dispenser", low "Dirty".
//   return [
//     [IDX.Clean, 0.85],
//     [IDX.Dirty, 0.15],
//     [IDX.Light_On, 0.9],
//     [IDX.Light_Off, 0.05],
//     [IDX.Soap, 0.6],
//     [IDX["Soap_Dispenser"], 0.65],
//     [IDX.Water, 0.55],
//     [IDX.Tap, 0.8],
//   ]
// }

// export async function analyzeImageForScores(imageUrl: string): Promise<Scores> {
//   const dets = await runModelStub(imageUrl)
//   const agg = aggregateClassProbs(dets, 0.2)
//   return scoreCategories(agg, 1.4)
// }

// export function overallFrom(scores: Scores) {
//   const vals = Object.values(scores)
//   return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
// }


// ----------------------------------------------------------------------------------------------------

// lib/ai-scoring.ts

// lib/ai-scoring.ts

// Class order must match the trained model indices
export const CLASS_NAMES = [
  "Clean", "Dirty", "Light_On", "Light_Off", "Soap", "Soap_Dispenser", "Water", "Tap",
] as const;

export type ClassName = (typeof CLASS_NAMES)[number];
export const IDX: Record<ClassName, number> =
  Object.fromEntries(CLASS_NAMES.map((n, i) => [n, i])) as any;

export type Detection = [classId: number, confidence: number];

export type Scores = {
  Cleanliness: number;
  Lighting: number;
  "Soap Dispenser": number;
  "Water Supply": number;
  "Odour Control": number; // higher = worse odour (severity)
};

// What FastAPI returns (aligned with your backend)
export type ApiResponse = {
  scores: Scores & { "Overall Score"?: number };
  class_presence_probabilities: Record<string, number>;
  input_image_url?: string;     // Cloudinary copy of input
  detected_image_url?: string;  // Cloudinary copy of annotated output
  image_url?: string;           // legacy (if backend returns single field)
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ---- optional local math helpers (kept for parity/fallback) ----
export function aggregateClassProbs(detections: Detection[], confMin = 0.2) {
  const byCls = new Map<number, number[]>();
  for (const [cid, conf] of detections) {
    const p = Number(conf);
    if (p >= confMin) {
      const arr = byCls.get(cid) ?? [];
      arr.push(clamp01(p));
      byCls.set(cid, arr);
    }
  }
  const agg = new Map<number, number>();
  for (const [c, ps] of byCls.entries()) {
    let prod = 1;
    for (const p of ps) prod *= 1 - p;
    agg.set(c, 1 - prod);
  }
  return agg;
}

function getProb(agg: Map<number, number>, name: ClassName) {
  return Number(agg.get(IDX[name]) ?? 0);
}

// Mirrors your Python score_categories (for stub fallback)
export function scoreCategories(clsProbs: Map<number, number>, odourGamma = 1.4): Scores {
  const clean = getProb(clsProbs, "Clean");
  const dirty = getProb(clsProbs, "Dirty");
  const light_on = getProb(clsProbs, "Light_On");
  const soap = getProb(clsProbs, "Soap");
  const disp = getProb(clsProbs, "Soap_Dispenser");
  const water = getProb(clsProbs, "Water");
  const tap = getProb(clsProbs, "Tap");

  const cleanliness = 100 * ((clean + (1 - dirty)) / 2);
  const lighting = 100 * light_on;
  const soapDisp = 100 * Math.sqrt(clamp01(disp) * clamp01(soap));
  const waterSupply = 100 * clamp01(0.6 * tap + 0.4 * water);

  let odour = 100 * Math.pow(dirty, odourGamma);
  odour = Math.max(0, Math.min(100, odour));

  return {
    Cleanliness: Math.round(cleanliness * 10) / 10,
    Lighting: Math.round(lighting * 10) / 10,
    "Soap Dispenser": Math.round(soapDisp * 10) / 10,
    "Water Supply": Math.round(waterSupply * 10) / 10,
    "Odour Control": Math.round(odour * 10) / 10,
  };
}

// ---- stub for dev without backend ----
export async function runModelStub(_imageRef: string): Promise<Detection[]> {
  return [
    [IDX.Clean, 0.85],
    [IDX.Dirty, 0.15],
    [IDX.Light_On, 0.9],
    [IDX.Light_Off, 0.05],
    [IDX.Soap, 0.6],
    [IDX["Soap_Dispenser"], 0.65],
    [IDX.Water, 0.55],
    [IDX.Tap, 0.8],
  ];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. http://localhost:8084

// Accepts a URL string (http/https or data URL) or a File from your uploader
export async function analyzeImageViaApi(input: string | File): Promise<ApiResponse> {
  const form = new FormData();

  if (typeof input === "string") {
    // Refuse blob: and file: — backend can’t fetch those
    if (input.startsWith("blob:") || input.startsWith("file:")) {
      throw new Error("blob:/file: URLs cannot be fetched by the server. Pass a File or public http(s)/data URL.");
    }
    if (!(input.startsWith("http") || input.startsWith("data:image/"))) {
      throw new Error("Only http(s) or data:image/... URLs are accepted as strings. Otherwise pass a File.");
    }
    form.append("image_url", input);
  } else {
    form.append("image", input);
  }

  // knobs (match backend defaults)
  form.append("conf_min", "0.2");
  form.append("imgsz", "640");
  form.append("odour_gamma", "1.4");
  form.append("conf_pred", "0.2");

  // If API_BASE is unset, you must have a Next proxy at /api/analyze
  const endpoint = API_BASE ? `${API_BASE}/analyze` : "/api/analyze";

  const r = await fetch(endpoint, { method: "POST", body: form });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
  const parsed = JSON.parse(text) as ApiResponse;

  // Make sure at least one of these URLs is present
  if (!parsed.detected_image_url && !parsed.image_url) {
    // not fatal for scoring, but good to know
    console.warn("[ai-scoring] No detected image URL in response.");
  }

  return parsed;
}

// Backwards-compatible helper your page calls.
// Uses API if available; falls back to stub for dev.
export async function analyzeImageForScores(input: string | File): Promise<Scores> {
  try {
    if (API_BASE || typeof window !== "undefined") {
      const { scores } = await analyzeImageViaApi(input);
      return scores;
    }
  } catch (e) {
    console.warn("API analyze failed, falling back to stub:", (e as Error)?.message);
  }
  const dets = await runModelStub(typeof input === "string" ? input : "uploaded-file");
  const agg = aggregateClassProbs(dets, 0.2);
  return scoreCategories(agg, 1.4);
}

export function overallFrom(scores: Scores) {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
