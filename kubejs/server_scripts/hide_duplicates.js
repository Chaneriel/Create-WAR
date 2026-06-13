// Create-WAR :: hide duplicate blocks/items added by multiple mods
//
// TWO mechanisms, both needed (corrected 2026-06-12 — jar-scan verified):
//   1. e.remove({output:...})  — makes the item UNCRAFTABLE. Does NOT hide it from
//      EMI: config/emi.css has `index-source: creative`, so EMI indexes creative-tab
//      stacks regardless of recipes. (The old header claimed EMI auto-hides
//      recipe-less items — wrong.)
//   2. ServerEvents.tags('item') adding `c:hidden_from_recipe_viewers` (bottom of this
//      file) — actually hides the item from EMI's index (support verified in EMI
//      1.1.22 bytecode, EmiStackList). Creative-menu visibility is unaffected, which
//      only matters in admin creative / the workshop dim (harmless).
//
// To enable a hide: uncomment the remove line AND add the id to the HIDDEN list.
// To revert: re-comment + remove from list + /reload (tags need a full restart).
//
// Canonical-owner notes (the one that STAYS visible):
//   - Gearboxes / encased shafts        -> create_mixed_casing (in-world recasing tool)
//   - Gyroscope                          -> AEROWORKS (user decision 2026-05-31; this
//     line previously said "gyro", stale — the gyro mod's item is one of the HIDDEN)
//   - Thruster                           -> createpropulsion
//   - Stirling Engine                    -> createpropulsion
//   - Andesite Girder                    -> createmoregirder
//   - Asphalt / Electronics (Cap, Trans) -> tfmg
//   - Train Stop / Buffer                -> railways (Steam'n'Rails)

ServerEvents.recipes(e => {
  // === GEARBOX FAMILY ===
  // DECISION PENDING (see tracker/docs/GEARBOX-AND-DUPES-DECISIONS_2026-06-12.md).
  // Truth table verified 2026-06-12: create:gearbox (vanilla law), CC brass_gearbox
  // (per-face flip — UNIQUE), CC six_way_gearbox (built-in 2:1/1:2 ratio — UNIQUE,
  // NOT redundant with configurable), createcasing configurable_gearbox (toggleable
  // faces ×9 styles — keep ONE), dndesires:omni_gearbox (same direction on all 6
  // faces — UNIQUE), parallel_gearbox (same-direction corners), pure skins from
  // createcasing (8) + create_mixed_casing (23) + tfmg:steel_gearbox.
  // NOTE for mixed_casing skins: remove ONLY type 'minecraft:crafting_shaped' — their
  // create:item_application recipes ARE the in-world restyle mechanic; a bare
  // e.remove({output}) would kill it.
  // Clean kill option for CC items: create_connected-common.toml feature toggles.
  // e.remove({ output: 'createcasing:brass_gearbox' })
  // e.remove({ output: 'createcasing:copper_gearbox' })
  // e.remove({ output: 'createcasing:railway_gearbox' })

  // === ENCASED SHAFTS / COGWHEELS (createcasing duplicates of create_mixed_casing) ===
  // e.remove({ output: 'createcasing:copper_encased_shaft' })
  // e.remove({ output: 'createcasing:copper_encased_cogwheel' })
  // e.remove({ output: 'createcasing:copper_encased_large_cogwheel' })
  // e.remove({ output: 'createcasing:railway_encased_shaft' })
  // e.remove({ output: 'createcasing:railway_encased_cogwheel' })
  // e.remove({ output: 'createcasing:railway_encased_large_cogwheel' })

  // === AERONAUTICS GYROSCOPE (user decision 2026-05-31: keep AEROWORKS only) ===
  // The standalone `gyro` MOD was removed entirely 2026-06-12 (single-block mod, zero
  // dependents and zero consumers — jar in tracker/archive/removed-mods), so its
  // gyroscope no longer needs hide lines here. air_wars' stabilizer is verified
  // independent of its missile remote-control (Navigator hasRequiredComponents() is a
  // no-op stub; no weapon class or recipe references it), so hiding it does NOT break
  // missiles.
  e.remove({ output: 'create_the_air_wars:gyro_stabilizer' })

  // === THRUSTER — KEEP BOTH (corrected 2026-05-31) ===
  // Earlier plan was to hide CP's thruster as "redundant", but that was wrong:
  // CP's thruster is a SIZE-SCALING MULTIBLOCK (1x1, 2x2x2 = 8 blocks, 3x3x3 = 27
  // blocks, rear-fed fuel manifold) — a distinct mechanic CT lacks (CT scales via
  // upgrade ITEMS in one block + gimbal + autopilot). They're complementary:
  //   - CP thruster  = build a big physical engine (airship aesthetic)
  //   - CT thruster  = compact, upgrade tiers, gimbal mounting, autopilot, FE-beam
  // Both now burn your oil economy (CT via thruster_fuel.js; CP natively).
  // Left visible. Disambiguated by lang rename instead (see assets/.../lang).
  // e.remove({ output: 'createpropulsion:thruster' })   // intentionally NOT hidden

  // === STIRLING ENGINE (user decision 2026-05-31: remove DnD's, keep createpropulsion's) ===
  e.remove({ output: 'dndesires:stirling_engine' })
  // Its partner dndesires:powered_flywheel never had a recipe at all (mechanics audit
  // 2026-06-12) — nothing to remove; hidden via the HIDDEN tag list below.

  // === CREATIVE GEAR MOTOR (dndesires + gnkinetics same-author twins) ===
  // NEITHER has a recipe (loot tables only) — recipe removal is a no-op for both.
  // If hiding one, use the HIDDEN tag list below. create:creative_motor also exists.
  // DECISION PENDING.

  // === ANDESITE GIRDER (CDG duplicate of createmoregirder) — DECISION PENDING ===
  // CDG's plain girder: zero consumers, hide-safe. Its _encased_shaft has NO recipe
  // (in-world encasing) — a remove line for it would be a no-op; it dies with the girder.
  // e.remove({ output: 'createdieselgenerators:andesite_girder' })

  // === STEEL CASING / COGWHEEL (Alloyed + SteamPowered vs TFMG) — DECISION PENDING ===
  // alloyed:steel_casing: zero consumers, hide-safe. alloyed:steel_encased_shaft has
  // no recipe (no-op line). ⚠ steampowered:steel_cogwheel is consumed BY ID ×4 in
  // steampowered:steel_flywheel (mechanical_crafting) — hiding it breaks SP's steel
  // engine tier unless the flywheel ingredient is kubejs-swapped to tfmg:steel_cogwheel.
  // e.remove({ output: 'alloyed:steel_casing' })
  // e.remove({ output: 'steampowered:steel_cogwheel' })

  // === ASPHALT (DnDesires + CDG vs TFMG) — DECISION PENDING ===
  // All three are plain decorative blocks (no speed code anywhere). TFMG = industrial
  // chain (block/slab/stairs/wall). DnD adds 16 DYED colors TFMG lacks — hiding DnD
  // removes colored roads entirely. CDG's block id is asphalt_block (NOT :asphalt —
  // the old commented line here was a no-op).
  // e.remove({ output: 'dndesires:asphalt' })   // + 16 '*_asphalt' colors if hiding
  // e.remove({ output: 'createdieselgenerators:asphalt_block' })
  // e.remove({ output: 'createdieselgenerators:asphalt_slab' })
  // e.remove({ output: 'createdieselgenerators:asphalt_stairs' })

  // === ELECTRONICS (vs TFMG capacitor/transistor/circuit_board/diode) — DECISION PENDING ===
  // create_designed_decor:capacitor — zero consumers, hide-safe.
  // create_designed_decor:transistor — consumed by its steel_circut_recipe (cascade).
  // create_designed_decor:magnet — consumed by its electrical_panel recipe (cascade).
  // trainutilities:transistor — consumed by its processing_unit + door tag; prefer
  //   ingredient-swap to tfmg:transistor_item over hiding.
  // dndesires:multimeter — NOT a duplicate (kinetic stressometer+speedometer combo
  //   gauge, convertible back) — KEEP; optional lang-rename "Kinetic Multimeter".
  // chipped:multimeter — vestigial no-op item (zero behavior code) — hide-safe.
  // e.remove({ output: 'create_designed_decor:capacitor' })
  // e.remove({ output: 'chipped:multimeter' })

  // (PUMPJACK CRANK section deleted 2026-06-12: stale. oil_unify.js already removes
  //  all CDG pumpjack part recipes and startup_scripts/main.js strips them from the
  //  CDG creative tab. tfmg:pumpjack_crank is the live oil system's part, not a dupe.)

  // === TRAIN STOP / BUFFER (T&M duplicates of Railways) — DECISION PENDING ===
  // Both T&M blocks are MCreator static props (extend Block, FACING only, no track-
  // graph integration); Railways' buffer family is functional + dyeable. Zero consumers.
  // e.remove({ output: 'create_things_and_misc:train_stop' })
  // e.remove({ output: 'create_things_and_misc:train_buffer' })

  // === ROPES (supplementaries vs farmersdelight) — DECISION PENDING ===
  // supplementaries:rope = feature-rich (pulley, hang, climb, rope arrow). FD's rope is
  // consumed BY ID in FD safety_net / rope_fence / rope_fence_gate — hiding FD rope
  // requires also hiding those three (or swapping their ingredient to #c:ropes).
  // Tomato vines are safe either way: both mods tag supplementaries:rope as
  // farmersdelight:ropes, so tomatoes climb supp ropes regardless.
  // e.remove({ output: 'farmersdelight:rope' })

  // === THROWN PIPE BOMBS (user decision 2026-06-12: keep cm's, hide TFMG's) ===
  // tfmg:pipe_bomb vs cmpackagepipebomb:pipebomb — both craftable, same thrown-bomb
  // role (recipes verified in both jars). The cm bomb chains into the unique
  // Rigged Pipebomb / TNT-package postbox trap mechanic, so it's the keeper.
  e.remove({ output: 'tfmg:pipe_bomb' })

  // === FOOD CRATES (user decision 2026-06-12: keep Farmer's Delight's, hide Quark's) ===
  // Exact duplicates; FD's integrate with its own food chain.
  e.remove({ output: 'quark:golden_carrot_crate' })
  e.remove({ output: 'quark:potato_crate' })
  e.remove({ output: 'quark:carrot_crate' })
  e.remove({ output: 'quark:beetroot_crate' })

  // === NTGL STANDALONE CONTENT (user decision 2026-06-12: CGS-only arsenal) ===
  // VERIFIED SAFE 2026-06-12 (full jar scan): CGS consumes ZERO ntgl items — every
  // "ntgl:" string in CGS weapon configs is a framework enum/animation, ammo is 100%
  // cgs: items, attachments are a bytecode-proven hard whitelist of cgs: ids, and no
  // recipe in any of the ~330 jars references any ntgl item. The ntgl JAR must stay
  // (framework dependency); its ITEMS are true orphans — none even have recipes, so
  // these removes are future-update guards, and the HIDDEN list below does the real
  // work of hiding them from EMI. ntgl:workbench is decorative in this build (no menu).
  e.remove({ output: 'ntgl:powdergun' })
  e.remove({ output: 'ntgl:grenade' })
  e.remove({ output: 'ntgl:stun_grenade' })
  e.remove({ output: 'ntgl:workbench' })
  e.remove({ output: 'ntgl:round10mm' })
  e.remove({ output: 'ntgl:round38' })
  e.remove({ output: 'ntgl:round45' })
  e.remove({ output: 'ntgl:round5mm' })
  e.remove({ output: 'ntgl:round44' })
  e.remove({ output: 'ntgl:round50' })
  e.remove({ output: 'ntgl:round380' })
  e.remove({ output: 'ntgl:round556' })
  e.remove({ output: 'ntgl:shell' })
  e.remove({ output: 'ntgl:steel_ball' })
  e.remove({ output: 'ntgl:short_scope' })
  e.remove({ output: 'ntgl:medium_scope' })
  e.remove({ output: 'ntgl:long_scope' })
  e.remove({ output: 'ntgl:silencer' })
  e.remove({ output: 'ntgl:light_stock' })
  e.remove({ output: 'ntgl:tactical_stock' })
  e.remove({ output: 'ntgl:weighted_stock' })
  e.remove({ output: 'ntgl:light_grip' })
  e.remove({ output: 'ntgl:specialised_grip' })

  // === SMART GEARBOX (user decision 2026-06-12: hide) ===
  // createthrusters:bidirectional_gearbox — unique features (dual independent kinetic
  // lanes + gyro servo steering) but its ponder ships EMPTY (blank screen) and the user
  // chose to cut it. The createthrusters MOD stays (thrusters/alternator/motor).
  // Revert: re-comment + remove from HIDDEN list, restart.
  e.remove({ output: 'createthrusters:bidirectional_gearbox' })

  // === FATMAN / MINI-NUKE — nuke DISABLED (Create-WAR 2026-06-05) ===
  // No recipe and no loot table, so already uncraftable; these guards keep them so if
  // a future ntgl update adds a recipe, and the HIDDEN list hides them from EMI.
  e.remove({ output: 'ntgl:fatman' })
  e.remove({ output: 'ntgl:mini_nuke' })
})

// === EMI INDEX HIDING ===
// `c:hidden_from_recipe_viewers` removes items from EMI's search index (the recipe
// removals above do NOT — emi.css uses index-source: creative). Restart required for
// tag changes; /reload is not enough on clients.
ServerEvents.tags('item', e => {
  const HIDDEN = [
    // approved hides that recipe removal alone left visible in EMI
    // (gyro:gyroscope dropped 2026-06-12 — its whole mod is removed)
    'create_the_air_wars:gyro_stabilizer',
    'dndesires:stirling_engine',
    'dndesires:powered_flywheel',
    'tfmg:pipe_bomb',
    'createthrusters:bidirectional_gearbox',
    // Quark variant chests (user 2026-06-12: "duplicate wood type chests"). TAG-HIDE
    // ONLY — recipes deliberately KEPT and the Quark module stays ON: 95 StyleColonies
    // blueprints (fairytale set) place these, so colony builders must still be able to
    // request + players to craft them. This just unclutters EMI.
    'quark:oak_chest', 'quark:spruce_chest', 'quark:birch_chest', 'quark:jungle_chest',
    'quark:acacia_chest', 'quark:dark_oak_chest', 'quark:mangrove_chest', 'quark:cherry_chest',
    'quark:bamboo_chest', 'quark:crimson_chest', 'quark:warped_chest', 'quark:azalea_chest',
    'quark:blossom_chest', 'quark:ancient_chest', 'quark:nether_brick_chest',
    'quark:prismarine_chest', 'quark:purpur_chest',
    'quark:trapped_oak_chest', 'quark:trapped_spruce_chest', 'quark:trapped_birch_chest',
    'quark:trapped_jungle_chest', 'quark:trapped_acacia_chest', 'quark:trapped_dark_oak_chest',
    'quark:trapped_mangrove_chest', 'quark:trapped_cherry_chest', 'quark:trapped_bamboo_chest',
    'quark:trapped_crimson_chest', 'quark:trapped_warped_chest', 'quark:trapped_azalea_chest',
    'quark:trapped_blossom_chest', 'quark:trapped_ancient_chest', 'quark:trapped_nether_brick_chest',
    'quark:trapped_prismarine_chest', 'quark:trapped_purpur_chest',
    'quark:golden_carrot_crate',
    'quark:potato_crate',
    'quark:carrot_crate',
    'quark:beetroot_crate',
    // ntgl standalone content (CGS-only arsenal; ntgl is framework-only)
    'ntgl:powdergun',
    'ntgl:grenade',
    'ntgl:stun_grenade',
    'ntgl:workbench',
    'ntgl:round10mm',
    'ntgl:round38',
    'ntgl:round45',
    'ntgl:round5mm',
    'ntgl:round44',
    'ntgl:round50',
    'ntgl:round380',
    'ntgl:round556',
    'ntgl:shell',
    'ntgl:steel_ball',
    'ntgl:short_scope',
    'ntgl:medium_scope',
    'ntgl:long_scope',
    'ntgl:silencer',
    'ntgl:light_stock',
    'ntgl:tactical_stock',
    'ntgl:weighted_stock',
    'ntgl:light_grip',
    'ntgl:specialised_grip',
    'ntgl:fatman',
    'ntgl:mini_nuke'
  ]
  e.add('c:hidden_from_recipe_viewers', HIDDEN)
})
