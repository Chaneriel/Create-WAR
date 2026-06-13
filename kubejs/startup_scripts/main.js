// Create-WAR :: startup scripts entry point
// Runs ONCE during game launch, before world load.
//
// IMPORTANT: changes to this file require a full client/server restart
// (not just /reload).
//
// API reference: https://kubejs.com/wiki/startup-scripts

console.info('[Create-WAR] startup_scripts loaded')

// === Hide duplicate / dead items from the creative menu + EMI ===
// Recipe removal (hide_duplicates.js / oil_unify.js) makes items UNCRAFTABLE but
// leaves them in their creative tab, so EMI still lists them. To remove from the
// menu/list we use the 2101 per-tab API: StartupEvents.modifyCreativeTab(tabId, ...)
// — singular + targeted (the old global modifyCreativeTabs(e=>e.removeFromAll())
// does NOT exist here and throws "Unknown event").
//
// CDG's dead oil blocks live in createdieselgenerators:cdg_creative_tab (verified).
// TFMG is the sole oil chain, so these extraction/refinery blocks are retired.
// NOTE (fixed 2026-06-12): pumpjack_bearing_b and distillation_tank are BLOCKS with
// no item form — referencing them threw "Item does not exist" at line 23 and ABORTED
// the whole handler, so the other hides never ran (startup.log-verified). Removed.
StartupEvents.modifyCreativeTab('createdieselgenerators:cdg_creative_tab', event => {
  event.remove('createdieselgenerators:oil_scanner')
  event.remove('createdieselgenerators:pumpjack_bearing')
  event.remove('createdieselgenerators:pumpjack_crank')
  event.remove('createdieselgenerators:pumpjack_head')
  event.remove('createdieselgenerators:pumpjack_hole')
  event.remove('createdieselgenerators:distillation_controller')
})

// RESOLVED 2026-06-12: the remaining EMI-visible hides (stirling engine, gyroscope,
// gyro_stabilizer, quark crates, all ntgl standalone content) are now hidden via the
// `c:hidden_from_recipe_viewers` item tag in server_scripts/hide_duplicates.js —
// EMI 1.1.22 honors it (bytecode-verified in EmiStackList), no tab-id hunting needed.
// modifyCreativeTab like the block above is only for cleaning the CREATIVE MENU
// itself; for EMI hiding alone, use the tag.
