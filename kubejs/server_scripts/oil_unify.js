// Create-WAR :: oil chain unification
// User decision 2026-05-31: TFMG is the SOLE oil extraction + refinery.
//
// Already done in config: createdieselgenerators-server.toml disables CDG oil
// chunks ("Disable normal oil chunks"/"Disable high oil chunks" = true), so
// TFMG's finite worldgen Oil Deposits are the only crude source.
//
// This script collapses the duplicate refining into TFMG's deep distillation
// tower and removes the recipes for CDG's now-dead extraction/refinery blocks
// so EMI hides them. What STAYS:
//   - CDG diesel engines (Normal/Modular/Huge) — they burn #c:diesel, so they
//     run on TFMG diesel via the shared tag. Verified in fuel_type/diesel.json.
//   - CDG's unique plant-oil -> ethanol -> biodiesel fuel chain (no crude, feeds
//     #c:fuel). A distinct alternative fuel source, not a duplicate of TFMG.
//
// Revert: delete this file + flip the two config lines back to false, /reload.

ServerEvents.recipes(e => {
  // --- collapse refining: TFMG tower is canonical ---
  e.remove({ id: 'createdieselgenerators:distillation/crude_oil' })
  e.remove({ id: 'createdieselgenerators:distillation/superheated_crude_oil' })

  // --- remove crafting recipes for now-dead CDG extraction/refinery blocks ---
  // (CDG extraction is disabled, so these can no longer function; hide them.)
  e.remove({ output: 'createdieselgenerators:oil_scanner' })
  e.remove({ output: 'createdieselgenerators:pumpjack_bearing' })
  e.remove({ output: 'createdieselgenerators:pumpjack_crank' })
  e.remove({ output: 'createdieselgenerators:pumpjack_head' })
  e.remove({ output: 'createdieselgenerators:pumpjack_hole' })
  e.remove({ output: 'createdieselgenerators:distillation_controller' })
  // distillation_tank removed 2026-06-12: block-only, no item form — the recipe
  // filter threw "Item does not exist" (server.log-verified) and was a no-op.
})


// --- Fuel-doctrine cross-compat (mechanics audit 2026-06-12) ---
// 1) tfmg:firebox_fuel ships tfmg-only fluids, so the kept renewable chain's
//    biodiesel couldn't heat a firebox. Added below. (Ethanol deliberately skipped:
//    fireboxes burn at a flat rate, so the cheapest fuel would be strictly optimal.)
// 2) CP thrusters' native table ranked gasoline BEST (125%) while the approved
//    refinement ladder (thruster_fuel.js) ranks it WORST - same fluids, opposite
//    doctrines. Fixed via createpropulsion-server.toml fuel arrays (diesel/kerosene
//    120,85; gasoline/naphtha/lpg 85,130) + kubejs/data/createpropulsion/
//    thruster_fuels/ overrides (KubeJS datapack wins over the mod's own).
// 3) Airship Portable Engines were lava-only. kubejs/data/portable_engine_liquid_fuel/
//    data_maps/fluid/engine_fuel.json adds #c:diesel (30k) + tfmg:kerosene (26k)
//    above lava (20k), so refining pays for airship time too. (Air-wars plane rocket
//    engines stay lava-only - hardcoded in bytecode; accepted asymmetry for now.)
ServerEvents.tags('fluid', e => {
  e.add('tfmg:firebox_fuel', 'createdieselgenerators:biodiesel')
})
