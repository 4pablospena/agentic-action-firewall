import type { ObservationEvent } from "../generated/event.js";

export interface ObservationStore {
  append(event: ObservationEvent): void;
  list(agentId?: string): ObservationEvent[];
  count(agentId?: string): number;
}

export class InMemoryObservationStore implements ObservationStore {
  private readonly events: ObservationEvent[] = [];

  append(event: ObservationEvent): void {
    this.events.push(event);
  }

  list(agentId?: string): ObservationEvent[] {
    if (!agentId) {
      return [...this.events];
    }
    return this.events.filter((event) => event.agent_id === agentId);
  }

  count(agentId?: string): number {
    return this.list(agentId).length;
  }
}
