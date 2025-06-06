# Behavior Model Notes

The pet behavior is intentionally lightweight and readable.

## Working Variables

- `hunger`
- `energy`
- `joy`
- `mood`
- `x, y`
- `facing`
- `sleeping`

## Current Rules

- hunger slowly decays over time
- energy decays while roaming and recovers during sleep
- joy decays slowly but increases when the user interacts
- the pet automatically sleeps when energy becomes too low
- the pet changes direction when it hits the viewport boundary

## Future Ideas

- context-sensitive reactions to scrolling
- curiosity behavior around links and images
- idle animations with richer timing
- mood changes based on time of day

- [2025-05-20] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-05-23] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-05-25] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-05-30] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-06-01] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-06-04] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.

- [2025-06-06] wrote down a small heuristic for state decay, patrol cadence, and when the pet should settle into a nap.
