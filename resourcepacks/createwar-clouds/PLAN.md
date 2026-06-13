# Create-WAR Clouds — Plan (resource-pack approach)

## Premise
- Goal: keep PMW's clouds + add cloud types + work with EuphoriaPatches + more
  efficient. Personal use only.
- Approach: a resource pack (`createwar-clouds`) that overrides PMW's
  `assets/pmweather/shaders/program/clouds.fsh`. PMW's jar is never modified —
  toggle the pack off and you have stock PMW. We copy PMW's real shader and
  modify it. No Java, no decompile, no Gradle build.
- The look is free — it IS PMW. The real work is the three gripes: cloud
  types, shader-pack compatibility, efficiency.
- Hard rule: every visual change verified with a real F2 screenshot.

## Phase 0 — Set up the resource pack  (no game)
- `resourcepacks/createwar-clouds/`: `pack.mcmeta` + PMW's `clouds.fsh`
  (unmodified baseline = identical to stock PMW).
- PMW enabled in `mods/`; `createwar-weather` disabled (avoid two cloud renderers).

## Phase 1 — Verify  (game running)
- Launch game; enable the `createwar-clouds` resource pack.
- Confirm PMW loads OUR `clouds.fsh` (the override takes effect).
- Establish the loop: edit `clouds.fsh` → reload (F3+T; restart if PMW doesn't
  hot-reload shaders) → F2 → read the PNG.
- Note how PMW's clouds look WITH EuphoriaPatches active — baseline for Phase 2.

## Phase 2 — Shader-pack compatibility  (the hard one — tackled early)
- Get PMW's clouds rendering correctly alongside EuphoriaPatches: turn off
  EuphoriaPatches' own clouds; fix how PMW's clouds composite under Iris.
- The genuine unknown. If it's a wall, we find out fast.

## Phase 3 — More cloud types
- Extend `clouds.fsh`: distinct cloud types by altitude + weather state.
  Fixes PMW's stormy / not-stormy boolean.

## Phase 4 — Efficiency
- Optimize the `clouds.fsh` hot loop; tune the perf `#define`s; FPS verified
  on the F2 screenshots.

## Phase 5 — Finish
- Final pass; verify; done.

## Rules
- Every visual step verified by a real F2 screenshot. No blind work.
- PMW's jar stays untouched. `createwar-weather` is the fallback.
- Honest progress — no claims without a screenshot proving it.
