# K_Binders_LivingMeta

Potassium Binders for RAASi Enablement: Living Meta-Analysis.

A single-file, offline-capable HTML dashboard (`K_BINDERS_REVIEW.html`) that
pools trial data with random-effects meta-analysis (REML τ² with a DerSimonian-Laird
sidecar, HKSJ-adjusted CI with a `max(1, q*)` floor, Q-profile τ²/I² confidence
intervals, and a `t_{k-1}` prediction interval per Cochrane Handbook v6.5). It also
includes optional registry-native panels (pseudo-IPD reconstruction, component NMA,
forensic checks) that stay inert unless the relevant trial fields are present.
`index.html` redirects to the dashboard.

## Tests

A zero-dependency smoke test checks the survival primitives against a hand-computed
reference case and basic shipped-HTML integrity:

```
node tests/smoke.test.js
```

_Status: Submission ready (portfolio registry)._
