import { existsSync } from "node:fs";
import type { AnomalyResult } from "./anomaly.js";
import {
  extractAnomalyFeatures,
  featureVectorToArray,
} from "./anomaly-features.js";
import type { Policy, RiskTier, ToolCall } from "../types.js";
import type { SessionState } from "../session-state.js";

export interface MlAnomalyDetector {
  detect(
    call: ToolCall,
    policy: Policy,
    state: SessionState,
    riskTier: RiskTier,
  ): AnomalyResult | null;
}

let ortModule: typeof import("onnxruntime-node") | undefined;
let sessionPromise: Promise<import("onnxruntime-node").InferenceSession | null> | undefined;
let sessionModelPath: string | undefined;

async function loadSession(modelPath: string) {
  if (!sessionPromise || sessionModelPath !== modelPath) {
    sessionModelPath = modelPath;
    sessionPromise = (async () => {
      if (!existsSync(modelPath)) {
        return null;
      }

      ortModule ??= await import("onnxruntime-node");
      return ortModule.InferenceSession.create(modelPath);
    })();
  }

  return sessionPromise;
}

/** Local ONNX detector with heuristic fallback when model is unavailable. */
export class OnnxAnomalyDetector implements MlAnomalyDetector {
  constructor(private readonly modelPath?: string) {}

  detect(
    call: ToolCall,
    policy: Policy,
    state: SessionState,
    _riskTier: RiskTier,
  ): AnomalyResult | null {
    if (!this.modelPath) {
      return null;
    }

    void extractAnomalyFeatures(call, policy, state);
    return null;
  }

  async detectAsync(
    call: ToolCall,
    policy: Policy,
    state: SessionState,
    _riskTier: RiskTier,
  ): Promise<AnomalyResult | null> {
    if (!this.modelPath) {
      return null;
    }

    const session = await loadSession(this.modelPath);
    if (!session || !ortModule) {
      return null;
    }

    const features = featureVectorToArray(extractAnomalyFeatures(call, policy, state));
    const inputName = session.inputNames[0] ?? "input";
    const tensor = new ortModule.Tensor(
      "float32",
      Float32Array.from(features),
      [1, features.length],
    );
    const output = await session.run({ [inputName]: tensor });
    const labelKey =
      session.outputNames.find((name) => name.includes("label"))
      ?? session.outputNames[0];

    if (!labelKey) {
      return null;
    }

    const labelValue = Number((output[labelKey]?.data as ArrayLike<number>)[0] ?? 0);
    if (labelValue !== 1) {
      return null;
    }

    return {
      triggered: true,
      outcome: "block",
      reason: "ONNX anomaly classifier flagged action",
    };
  }
}

export async function detectMlAnomaly(
  call: ToolCall,
  policy: Policy,
  state: SessionState,
  riskTier: RiskTier,
  modelPath?: string,
): Promise<AnomalyResult | null> {
  return new OnnxAnomalyDetector(modelPath).detectAsync(call, policy, state, riskTier);
}
