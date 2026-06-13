// Create-WAR :: RESTYLE UNIFICATION (gearboxes / casings / encased blocks)
// DRAFT 2026-06-12 — install to minecraft/kubejs/server_scripts/ after review.
// Companion doc: tracker/source/gearbox-unification/VERIFICATION.md (read it first).
//
// USER DECISION 2026-06-12: right-click restyle (create:item_application) is the
// TRUE mechanic for gearbox/casing/encased looks pack-wide; redundant crafted skin
// variants are hidden from EMI (same two mechanisms as hide_duplicates.js:
// e.remove for craftability + c:hidden_from_recipe_viewers for the EMI index).
//
// HOW THE EXISTING ENGINE WORKS (bytecode-verified, see VERIFICATION.md §2):
//   create_mixed_casing mixes into Create's ManualApplicationRecipe.testBlock and
//   AUTO-EXTENDS every casing→casing item_application recipe to:
//     - plain gearboxes  (block whose BE is GearboxBlockEntity; result style is
//       looked up as <style>_gearbox in ns [create, create_mixed_casing,
//       createcasing] — NOT tfmg, hence the direct tfmg recipes below)
//     - encased shafts/cogs/pipes (via Create's EncasingRegistry, ANY namespace)
//     - belts and copycats
//   So we unify at the CASING level wherever possible — one recipe per style —
//   and only add direct gearbox-level recipes for tfmg steel (engine can't map it).
//
// WHY EXPLICIT ITEM ARRAYS INSTEAD OF ONE INPUT TAG (brief asked to try a tag):
//   Tags ARE supported by the block-input ingredient (vanilla Ingredient — proof:
//   create's own andesite_casing_from_log.json uses {"tag":"c:stripped_logs"}).
//   But a single all-casings tag would (a) allow style→same-style clicks that eat
//   the key item for nothing, and (b) shadow create_mixed_casing's own pairwise
//   recipes, which REFUND the displaced material (ours can't — one recipe per
//   style means no per-source refund). Arrays let each recipe list only the
//   sources the mixed_casing network does NOT already cover. Still 1 recipe per
//   style, generated from the const lists below.
//
// COLLISION RULE (the one that matters): a (clicked block, held item) pair must
// be claimed by at most ONE matching recipe path, or the engine + vanilla path
// can both fire and double-consume. Our arrays are disjoint from every existing
// item_application input pair (verified in VERIFICATION.md §4).

// ---------------------------------------------------------------------------
// ID GROUPS (all verified against jar loot tables / item models 2026-06-12)
// ---------------------------------------------------------------------------

// create base casings (KEEP visible; they are the metal network's anchors)
const BASE_CASINGS = [
  'create:andesite_casing',
  'create:brass_casing',
  'create:copper_casing',
  'create:railway_casing',
]

// create_mixed_casing matrix casings (19). Each metal deliberately SKIPS its
// "native" wood — that combination IS the create base casing:
//   andesite+spruce = create:andesite_casing, brass+dark_oak = create:brass_casing,
//   copper+acacia = create:copper_casing, iron+cherry = create_mixed_casing:iron_casing,
//   railway+brass = create:railway_casing.
const MIXED_CASINGS = [
  'create_mixed_casing:andesite_acacia_casing',
  'create_mixed_casing:andesite_cherry_casing',
  'create_mixed_casing:andesite_dark_oak_casing',
  'create_mixed_casing:andesite_mixed_casing',
  'create_mixed_casing:brass_acacia_casing',
  'create_mixed_casing:brass_cherry_casing',
  'create_mixed_casing:brass_mixed_casing',
  'create_mixed_casing:brass_spruce_casing',
  'create_mixed_casing:copper_cherry_casing',
  'create_mixed_casing:copper_dark_oak_casing',
  'create_mixed_casing:copper_mixed_casing',
  'create_mixed_casing:copper_spruce_casing',
  'create_mixed_casing:iron_acacia_casing',
  'create_mixed_casing:iron_dark_oak_casing',
  'create_mixed_casing:iron_mixed_casing',
  'create_mixed_casing:iron_spruce_casing',
  'create_mixed_casing:railway_andesite_casing',
  'create_mixed_casing:railway_copper_casing',
  'create_mixed_casing:railway_iron_casing',
]
const IRON_CASING = 'create_mixed_casing:iron_casing' // 5th base metal (iron+cherry)

// styles OUTSIDE the mixed_casing network (the bridges this script adds)
const II_CASING    = 'create:industrial_iron_block'     // craftable: stonecut iron ingot
const WI_CASING    = 'create:weathered_iron_block'      // craftable: stonecut iron ingot
const RR_CASING    = 'create:refined_radiance_casing'   // NO recipe in create 6 → creative-only style
const SS_CASING    = 'create:shadow_steel_casing'       // NO recipe in create 6 → creative-only style
const STEEL_CASING = 'tfmg:steel_casing'                // craftable (tfmg)

// the whole already-interlinked casing network (mixed_casing data covers all
// internal moves with material refunds — we do NOT re-add those)
const MIXED_NETWORK = BASE_CASINGS.concat(MIXED_CASINGS).concat([IRON_CASING])

// plain-gearbox family (skins of create:gearbox; CC brass/six-way/parallel and
// dndesires omni are FUNCTIONAL and never appear in this script)
const MIXED_GEARBOXES = [
  'create_mixed_casing:andesite_acacia_gearbox',
  'create_mixed_casing:andesite_cherry_gearbox',
  'create_mixed_casing:andesite_dark_oak_gearbox',
  'create_mixed_casing:andesite_mixed_gearbox',
  'create_mixed_casing:brass_gearbox',          // brass+dark_oak look (create:brass_casing style)
  'create_mixed_casing:brass_acacia_gearbox',
  'create_mixed_casing:brass_cherry_gearbox',
  'create_mixed_casing:brass_mixed_gearbox',
  'create_mixed_casing:brass_spruce_gearbox',
  'create_mixed_casing:copper_gearbox',
  'create_mixed_casing:copper_cherry_gearbox',
  'create_mixed_casing:copper_dark_oak_gearbox',
  'create_mixed_casing:copper_mixed_gearbox',
  'create_mixed_casing:copper_spruce_gearbox',
  'create_mixed_casing:iron_gearbox',
  'create_mixed_casing:iron_acacia_gearbox',
  'create_mixed_casing:iron_dark_oak_gearbox',
  'create_mixed_casing:iron_mixed_gearbox',
  'create_mixed_casing:iron_spruce_gearbox',
  'create_mixed_casing:railway_gearbox',
  'create_mixed_casing:railway_andesite_gearbox',
  'create_mixed_casing:railway_copper_gearbox',
  'create_mixed_casing:railway_iron_gearbox',
]
const CC_GEARBOXES = [
  'createcasing:brass_gearbox',            // duplicate look of mixed's — engine always outputs mixed's (ns order)
  'createcasing:copper_gearbox',
  'createcasing:creative_gearbox',
  'createcasing:industrial_iron_gearbox',
  'createcasing:railway_gearbox',
  'createcasing:refined_radiance_gearbox',
  'createcasing:shadow_steel_gearbox',
  'createcasing:weathered_iron_gearbox',
]
const ALL_PLAIN_GEARBOXES = ['create:gearbox'].concat(MIXED_GEARBOXES).concat(CC_GEARBOXES)

ServerEvents.recipes(e => {
  const I = id => ({ item: id })
  const T = id => ({ tag: id })
  const arr = ids => ids.map(id => ({ item: id }))

  // raw-JSON item_application (create 6 shape, copied from create's own data —
  // results entry uses the {"id": ...} form create itself ships)
  function restyle(id, blockIngredient, keyIngredient, outputId) {
    e.custom({
      type: 'create:item_application',
      ingredients: [blockIngredient, keyIngredient],
      results: [{ id: outputId }],
    }).id('createwar:restyle/' + id)
  }

  // =========================================================================
  // A. NEW BRIDGE RECIPES (16)
  // =========================================================================

  // --- A1. out of the NEW styles, into the mixed network (5 recipes) --------
  // Inputs are ONLY the five new-style casings: every move inside the mixed
  // network already exists in create_mixed_casing's data (with refunds).
  // The engine extends each of these to gearboxes/encased/copycats for free.
  const NEW_STYLE_CASINGS = [II_CASING, WI_CASING, RR_CASING, SS_CASING, STEEL_CASING]
  restyle('casing/andesite_from_new_styles', arr(NEW_STYLE_CASINGS), I('create:andesite_alloy'), 'create:andesite_casing')
  restyle('casing/brass_from_new_styles',    arr(NEW_STYLE_CASINGS), T('c:ingots/brass'),        'create:brass_casing')
  restyle('casing/copper_from_new_styles',   arr(NEW_STYLE_CASINGS), T('c:ingots/copper'),       'create:copper_casing')
  restyle('casing/iron_from_new_styles',     arr(NEW_STYLE_CASINGS), T('c:ingots/iron'),         IRON_CASING)
  restyle('casing/railway_from_new_styles',  arr(NEW_STYLE_CASINGS), T('c:plates/obsidian'),     'create:railway_casing')

  // --- A2. into the createcasing-exclusive styles (2 recipes) ---------------
  // Key item = the style's own casing block (same key the free-swap uses; the
  // two mechanics are mutually exclusive per click — see VERIFICATION.md §6 Q1).
  // refined_radiance / shadow_steel get NO "into" recipes: their casings have no
  // recipe in create 6 → creative-only styles (policy §4). They DO appear as
  // inputs everywhere, so creative-built blocks can always be restyled back out.
  restyle('casing/industrial_iron_from_any',
    arr(MIXED_NETWORK.concat([WI_CASING, RR_CASING, SS_CASING, STEEL_CASING])),
    I(II_CASING), II_CASING)
  restyle('casing/weathered_iron_from_any',
    arr(MIXED_NETWORK.concat([II_CASING, RR_CASING, SS_CASING, STEEL_CASING])),
    I(WI_CASING), WI_CASING)

  // --- A3. tfmg steel casing (1 recipe) --------------------------------------
  restyle('casing/steel_from_any',
    arr(MIXED_NETWORK.concat([II_CASING, WI_CASING, RR_CASING, SS_CASING])),
    T('c:ingots/steel'), STEEL_CASING)

  // --- A4. tfmg steel gearbox — DIRECT recipes (engine cannot map "steel": its
  // gearbox lookup only searches create/create_mixed_casing/createcasing) ------
  // IN (1): any plain gearbox + steel ingot. Safe alongside A3: when A3 matches
  // a gearbox via the engine it cancels-but-cannot-map (no steel_gearbox in the
  // 3 namespaces) and falls through; this vanilla-path recipe then converts.
  // Exactly one consumption either way (trace in VERIFICATION.md §2.4).
  restyle('gearbox/steel_from_any', arr(ALL_PLAIN_GEARBOXES), T('c:ingots/steel'), 'tfmg:steel_gearbox')

  // OUT (7): the engine never fires on tfmg:steel_gearbox (style lookup fails
  // before any recipe test), so these vanilla-path recipes own the block.
  // Axis is preserved by BlockHelper.copyProperties → vertical stays vertical.
  // Targets = the canonical skin owner per style (mixed for brass/copper/iron/
  // railway — same block the engine itself outputs; createcasing for ii/wi).
  const STEEL_GB = arr(['tfmg:steel_gearbox'])
  restyle('gearbox/andesite_from_steel',        STEEL_GB, I('create:andesite_alloy'), 'create:gearbox')
  restyle('gearbox/brass_from_steel',           STEEL_GB, T('c:ingots/brass'),        'create_mixed_casing:brass_gearbox')
  restyle('gearbox/copper_from_steel',          STEEL_GB, T('c:ingots/copper'),       'create_mixed_casing:copper_gearbox')
  restyle('gearbox/iron_from_steel',            STEEL_GB, T('c:ingots/iron'),         'create_mixed_casing:iron_gearbox')
  restyle('gearbox/railway_from_steel',         STEEL_GB, T('c:plates/obsidian'),     'create_mixed_casing:railway_gearbox')
  restyle('gearbox/industrial_iron_from_steel', STEEL_GB, I(II_CASING),               'createcasing:industrial_iron_gearbox')
  restyle('gearbox/weathered_iron_from_steel',  STEEL_GB, I(WI_CASING),               'createcasing:weathered_iron_gearbox')

  // NOTE deliberately NOT added:
  //  - encased shaft/cog direct recipes: the engine already extends every casing
  //    recipe to them via EncasingRegistry (any namespace, large-cog aware).
  //  - configurable gearbox recipes: different BE; createcasing's own in-code
  //    free-swap (casingBlockSwappable, ON in this pack) already restyles all 9
  //    configurable styles in place, faces preserved. See policy §4.
  //  - anything into refined_radiance / shadow_steel / creative styles.
  //  - create_extra_casing (dyed casings): self-contained dye/washing system,
  //    no gearbox variants — left untouched (VERIFICATION.md §7).

  // =========================================================================
  // B. RECIPE REMOVALS — make the crafted skins uncraftable (71 outputs)
  // =========================================================================
  // ALL removes below are plain crafting_shaped/crafting_shapeless recipes,
  // verified to exist in the jars (file list in VERIFICATION.md §5).
  // NONE of these items is ever a create:item_application OUTPUT (gearbox
  // restyling happens at block level inside the mixin), so e.remove({output})
  // cannot touch the restyle mechanic itself.
  // The matrix CASINGS have no crafting recipes at all (item_application +
  // saw-salvage only) — nothing to remove there, tag-hide only (§C).

  // --- mixed_casing gearbox skins (canonical skin owner, but crafting is now
  //     redundant: every one is a right-click away from create:gearbox) -------
  // covers crafting/gearbox/<name>.json + crafting/gearbox/conversion/<name>.json
  MIXED_GEARBOXES.forEach(id => e.remove({ output: id }))
  // covers crafting/gearbox/vertical/<name>.json (+ vertical/conversion/*)
  // vertical skin ITEMS are placement helpers only; create:vertical_gearbox +
  // in-place restyle replaces them (axis survives the conversion)
  MIXED_GEARBOXES.forEach(id => e.remove({ output: id.replace('create_mixed_casing:', 'create_mixed_casing:vertical_') }))

  // --- createcasing styled plain gearboxes (8) + vertical items (8) ----------
  // brass/copper/railway are straight duplicates of mixed_casing's skins (the
  // engine always outputs mixed's by namespace order); ii/wi/rr/ss/creative
  // stay reachable in-world via the new A2 recipes, the free-swap, and the
  // chorium recipe respectively. covers crafting/gearbox/<style>.json,
  // <style>_from_conversion.json, <style>_vertical.json,
  // <style>_vertical_from_conversion.json
  CC_GEARBOXES.forEach(id => e.remove({ output: id }))
  CC_GEARBOXES.forEach(id => e.remove({ output: id.replace('createcasing:', 'createcasing:vertical_') }))

  // --- configurable gearbox: keep ONE craftable style (brass), hide the rest -
  // (policy §4: not restyle-unified via recipes — different BE. createcasing's
  // free-swap already restyles them in place if the player holds another
  // style's casing, faces preserved.) covers crafting/configurable_gearbox/<style>.json
  e.remove({ output: 'createcasing:andesite_configurable_gearbox' })
  e.remove({ output: 'createcasing:copper_configurable_gearbox' })
  e.remove({ output: 'createcasing:creative_configurable_gearbox' })
  e.remove({ output: 'createcasing:industrial_iron_configurable_gearbox' })
  e.remove({ output: 'createcasing:railway_configurable_gearbox' })
  e.remove({ output: 'createcasing:refined_radiance_configurable_gearbox' })
  e.remove({ output: 'createcasing:shadow_steel_configurable_gearbox' })
  e.remove({ output: 'createcasing:weathered_iron_configurable_gearbox' })
  // KEPT: createcasing:brass_configurable_gearbox (crafting/configurable_gearbox/brass.json)

  // --- tfmg steel gearbox skin ------------------------------------------------
  // covers crafting/materials/steel_gearbox.json; reachable via A4-IN.
  // tfmg:steel_vertical_gearbox has NO recipe in the jar (verified) — no remove
  // line for it (would be a no-op); HIDDEN-tag only.
  e.remove({ output: 'tfmg:steel_gearbox' })

  // KEPT CRAFTABLE (untouched): create:gearbox + create:vertical_gearbox (and
  // both _from_conversion recipes), createcasing:brass_configurable_gearbox,
  // create_connected brass/six_way/parallel gearboxes, dndesires:omni_gearbox,
  // all casings used as keys, all create base casings, tfmg:steel_casing,
  // createcasing:creative_casing (+ chorium chain), every casing plank/plate.
})

// ===========================================================================
// C. EMI INDEX HIDING (92 items) — same mechanism as hide_duplicates.js
// ===========================================================================
// Recipe removal alone does NOT hide items (emi.css index-source: creative).
// Tag changes need a full restart, not just /reload.
ServerEvents.tags('item', e => {
  const HIDDEN = [
    // --- mixed_casing gearbox skins (23) — restyle from create:gearbox instead
    'create_mixed_casing:andesite_acacia_gearbox',
    'create_mixed_casing:andesite_cherry_gearbox',
    'create_mixed_casing:andesite_dark_oak_gearbox',
    'create_mixed_casing:andesite_mixed_gearbox',
    'create_mixed_casing:brass_gearbox',
    'create_mixed_casing:brass_acacia_gearbox',
    'create_mixed_casing:brass_cherry_gearbox',
    'create_mixed_casing:brass_mixed_gearbox',
    'create_mixed_casing:brass_spruce_gearbox',
    'create_mixed_casing:copper_gearbox',
    'create_mixed_casing:copper_cherry_gearbox',
    'create_mixed_casing:copper_dark_oak_gearbox',
    'create_mixed_casing:copper_mixed_gearbox',
    'create_mixed_casing:copper_spruce_gearbox',
    'create_mixed_casing:iron_gearbox',
    'create_mixed_casing:iron_acacia_gearbox',
    'create_mixed_casing:iron_dark_oak_gearbox',
    'create_mixed_casing:iron_mixed_gearbox',
    'create_mixed_casing:iron_spruce_gearbox',
    'create_mixed_casing:railway_gearbox',
    'create_mixed_casing:railway_andesite_gearbox',
    'create_mixed_casing:railway_copper_gearbox',
    'create_mixed_casing:railway_iron_gearbox',
    // --- mixed_casing vertical gearbox skin items (23)
    'create_mixed_casing:vertical_andesite_acacia_gearbox',
    'create_mixed_casing:vertical_andesite_cherry_gearbox',
    'create_mixed_casing:vertical_andesite_dark_oak_gearbox',
    'create_mixed_casing:vertical_andesite_mixed_gearbox',
    'create_mixed_casing:vertical_brass_gearbox',
    'create_mixed_casing:vertical_brass_acacia_gearbox',
    'create_mixed_casing:vertical_brass_cherry_gearbox',
    'create_mixed_casing:vertical_brass_mixed_gearbox',
    'create_mixed_casing:vertical_brass_spruce_gearbox',
    'create_mixed_casing:vertical_copper_gearbox',
    'create_mixed_casing:vertical_copper_cherry_gearbox',
    'create_mixed_casing:vertical_copper_dark_oak_gearbox',
    'create_mixed_casing:vertical_copper_mixed_gearbox',
    'create_mixed_casing:vertical_copper_spruce_gearbox',
    'create_mixed_casing:vertical_iron_gearbox',
    'create_mixed_casing:vertical_iron_acacia_gearbox',
    'create_mixed_casing:vertical_iron_dark_oak_gearbox',
    'create_mixed_casing:vertical_iron_mixed_gearbox',
    'create_mixed_casing:vertical_iron_spruce_gearbox',
    'create_mixed_casing:vertical_railway_gearbox',
    'create_mixed_casing:vertical_railway_andesite_gearbox',
    'create_mixed_casing:vertical_railway_copper_gearbox',
    'create_mixed_casing:vertical_railway_iron_gearbox',
    // --- mixed_casing matrix casings (20, incl. iron_casing) — in-world skins;
    //     reachable via planks/ingots on the visible base casings
    'create_mixed_casing:andesite_acacia_casing',
    'create_mixed_casing:andesite_cherry_casing',
    'create_mixed_casing:andesite_dark_oak_casing',
    'create_mixed_casing:andesite_mixed_casing',
    'create_mixed_casing:brass_acacia_casing',
    'create_mixed_casing:brass_cherry_casing',
    'create_mixed_casing:brass_mixed_casing',
    'create_mixed_casing:brass_spruce_casing',
    'create_mixed_casing:copper_cherry_casing',
    'create_mixed_casing:copper_dark_oak_casing',
    'create_mixed_casing:copper_mixed_casing',
    'create_mixed_casing:copper_spruce_casing',
    'create_mixed_casing:iron_casing',
    'create_mixed_casing:iron_acacia_casing',
    'create_mixed_casing:iron_dark_oak_casing',
    'create_mixed_casing:iron_mixed_casing',
    'create_mixed_casing:iron_spruce_casing',
    'create_mixed_casing:railway_andesite_casing',
    'create_mixed_casing:railway_copper_casing',
    'create_mixed_casing:railway_iron_casing',
    // --- createcasing styled plain gearboxes (8) + verticals (8)
    'createcasing:brass_gearbox',
    'createcasing:copper_gearbox',
    'createcasing:creative_gearbox',
    'createcasing:industrial_iron_gearbox',
    'createcasing:railway_gearbox',
    'createcasing:refined_radiance_gearbox',
    'createcasing:shadow_steel_gearbox',
    'createcasing:weathered_iron_gearbox',
    'createcasing:vertical_brass_gearbox',
    'createcasing:vertical_copper_gearbox',
    'createcasing:vertical_creative_gearbox',
    'createcasing:vertical_industrial_iron_gearbox',
    'createcasing:vertical_railway_gearbox',
    'createcasing:vertical_refined_radiance_gearbox',
    'createcasing:vertical_shadow_steel_gearbox',
    'createcasing:vertical_weathered_iron_gearbox',
    // --- configurable gearbox styles (8; brass stays visible/craftable)
    'createcasing:andesite_configurable_gearbox',
    'createcasing:copper_configurable_gearbox',
    'createcasing:creative_configurable_gearbox',
    'createcasing:industrial_iron_configurable_gearbox',
    'createcasing:railway_configurable_gearbox',
    'createcasing:refined_radiance_configurable_gearbox',
    'createcasing:shadow_steel_configurable_gearbox',
    'createcasing:weathered_iron_configurable_gearbox',
    // --- tfmg steel gearbox skins (2)
    'tfmg:steel_gearbox',
    'tfmg:steel_vertical_gearbox',
  ]
  e.add('c:hidden_from_recipe_viewers', HIDDEN)
})
