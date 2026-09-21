# ADR 150: security(ratelimit): implement tier-based sliding window rate limiter by Stellar public key

## Context
This ADR addresses issue #150: security(ratelimit): implement tier-based sliding window rate limiter by Stellar public key.
We needed to define a clear architectural strategy to resolve the requirements outlined in the issue.

## Decision
We have decided to formally adopt the strategy proposed in the issue description. The implementation will follow our standard enterprise patterns (e.g., proper state management, strict typing, telemetry, and error handling).

## Status
Accepted and resolved.
