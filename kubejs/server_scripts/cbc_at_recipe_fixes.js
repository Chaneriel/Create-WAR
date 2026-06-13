// Create-WAR :: cbc_at broken-recipe restoration (2026-06-12)
//
// cbc_at 0.1.4c ships seven create:cutting "cast mould" recipes; four use the
// 1.21 results key ("id") and load fine, but THREE still use the 1.20 key
// ("item") and hard-fail at parse (RecipeManager: "No key amount in MapLike
// [{"item":"cbc_at:..."}]" — latest.log 2026-06-12 14:47:53). The mod author
// missed them in the port. Without these, the rocket pod rail/breech and twin
// autocannon barrel cannot be cast — three war-relevant guns gone.
//
// These re-adds mirror the WORKING sibling recipes byte-for-byte (same type,
// same #minecraft:logs ingredient, results with "id" key, count/processing
// defaults identical) under our own recipe ids — the broken originals never
// load, so there is no collision. Delete this file when cbc_at fixes upstream.

ServerEvents.recipes(e => {
  e.custom({
    type: 'create:cutting',
    ingredients: [{ tag: 'minecraft:logs' }],
    results: [{ id: 'cbc_at:rocket_pod_rail_mould' }]
  }).id('createwar:cbc_at_fix/rocket_pod_rail_cast_mould')

  e.custom({
    type: 'create:cutting',
    ingredients: [{ tag: 'minecraft:logs' }],
    results: [{ id: 'cbc_at:rocket_pod_breech_mould' }]
  }).id('createwar:cbc_at_fix/rocket_pod_breech_cast_mould')

  e.custom({
    type: 'create:cutting',
    ingredients: [{ tag: 'minecraft:logs' }],
    results: [{ id: 'cbc_at:twin_autocannon_barrel_mould' }]
  }).id('createwar:cbc_at_fix/twin_autocannon_barrel_cast_mould')
})
