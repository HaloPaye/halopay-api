# ADR-004: Horizon LRU Cache

## Context
Hitting Horizon rate limits causes downtime.

## Decision
Implement a multi-tiered in-memory LRU cache with a 5s TTL.

## Consequences
Reduces rate limiting by 90% but introduces up to 5s of stale reads.
