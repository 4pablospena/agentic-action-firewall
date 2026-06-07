import type { AnomalyResult } from "./anomaly.js";
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

/** Placeholder ONNX detector — returns null until a model is loaded (Slice 6). */
export class OnnxAnomalyDetector implements MlAnomalyDetector {
  constructor(private readonly modelPath?: string) {}

  detect(
    _call: ToolCall,
    _policy: Policy,
    _state: SessionState,
    _riskTier: RiskTier,
  ): AnomalyResult | null {
    if (!this.modelPath) {
      return null;
    }
    return null;
  }
}
