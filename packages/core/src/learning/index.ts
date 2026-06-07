export { isLearningModeActive, observationHours } from "./is-learning-mode.js";
export {
  InMemoryObservationStore,
  type ObservationStore,
} from "./observation-store.js";
export { ObservationRecorder } from "./observation-recorder.js";
export { buildBaseline, baselineToPolicyYamlSnippet } from "./baseline-builder.js";
export { resolveObservationDbPath } from "./resolve-observation-db-path.js";
export { SqliteObservationStore } from "./sqlite-observation-store.js";
import { SqliteObservationStore } from "./sqlite-observation-store.js";
import { resolveObservationDbPath } from "./resolve-observation-db-path.js";

export function createDefaultObservationStore(dbPath?: string): SqliteObservationStore {
  return new SqliteObservationStore(resolveObservationDbPath(dbPath));
}
