// Create-WAR :: feed Create Thrusters' thruster with your oil-economy fuels
// User decision 2026-05-31: "combine" the two thrusters into one.
//
// Create Thrusters' thruster already had everything Create Propulsion's basic
// thruster had EXCEPT it didn't burn your pack's liquid fuels (its fuel tags only
// list lava + fuels from mods not installed here). This script adds the TFMG/CDG
// oil-chain fuels, so CT's thruster now does it all: gimbal mounting + upgrade
// tiers (2-16x) + autopilot + FE-beam mode + your liquid fuel economy.
//
// CT's thruster fuel is tag-driven. Tiers REBALANCED 2026-06-12 (user approved fixing
// the inversion the audit found: raw seed-pressed plant oil sat in the BEST tier while
// refined jet fuel was neutral, making the whole oil-refining chain pointless for
// thrusters). New ladder — refinement depth pays off monotonically:
//   dense   (1.45x, per createthrusters-common.toml): FINISHED refined fuels
//           (diesel, kerosene — jet fuel belongs in a jet)
//   neutral (1.00x): INTERMEDIATES (heavy oil = one distillation step;
//           biodiesel = processed renewable — the mid-tier renewable path)
//   light   (0.70x): RAW + VOLATILES (plant oil straight from the press,
//           gasoline/naphtha/lpg/ethanol fast-burners)
//   base    (everything): usability guarantee (the mod shipped its dense/light
//           tags in a legacy 'tags/fluids' folder that may not resolve on 1.21,
//           so base membership guarantees the fuel is at least accepted).
//
// Pairs with: createpropulsion:thruster hidden in hide_duplicates.js (redundant).
// CP keeps its UNIQUE blocks — Wing, Ion Thruster, Vector Thruster, burners, FE
// power — none of which overlap CT.

ServerEvents.tags('fluid', event => {
  // finished refined fuels -> most efficient
  const dense = [
    'tfmg:diesel',
    'createdieselgenerators:diesel',   // CDG's (vestigial; survival only makes TFMG diesel, but keep parity)
    'tfmg:kerosene'
  ]
  // raw + volatile -> least efficient
  const light = [
    'createdieselgenerators:plant_oil', // raw seed-press output (was wrongly top-tier)
    'tfmg:gasoline',
    'createdieselgenerators:gasoline', // CDG's (vestigial; parity)
    'tfmg:naphtha',
    'tfmg:lpg',
    'createdieselgenerators:ethanol'
  ]
  // intermediates (one processing step) -> neutral
  const neutral = [
    'tfmg:heavy_oil',
    'createdieselgenerators:biodiesel'
  ]

  const all = dense.concat(light).concat(neutral)

  all.forEach(f => event.add('createthrusters:thruster_fuels', f))
  dense.forEach(f => event.add('createthrusters:thruster_fuels_dense', f))
  light.forEach(f => event.add('createthrusters:thruster_fuels_light', f))
})
