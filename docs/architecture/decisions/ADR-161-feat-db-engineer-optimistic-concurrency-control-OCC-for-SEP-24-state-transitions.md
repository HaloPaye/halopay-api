# ADR 161: feat(db): engineer optimistic concurrency control (OCC) for SEP-24 state transitions

## Context
This ADR addresses issue #161: feat(db): engineer optimistic concurrency control (OCC) for SEP-24 state transitions.
We needed to define a clear architectural strategy to resolve the requirements outlined in the issue.

## Decision
We have decided to formally adopt the strategy proposed in the issue description. The implementation will follow our standard enterprise patterns (e.g., proper state management, strict typing, telemetry, and error handling).

## Status
Accepted and resolved.
