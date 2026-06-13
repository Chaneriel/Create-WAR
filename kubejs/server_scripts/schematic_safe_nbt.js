// Create-WAR :: make cannon/radar control blocks keep their settings in schematics
//
// THE PROBLEM (bytecode-verified 2026-06-12, see tracker/docs/SESSION_HANDOFF + the
// schematic-NBT investigation): Create's Schematic & Quill CAPTURES full block-entity
// NBT, but PRINTING (schematicannon AND creative instant-place) strips it unless the
// block opts in — via the `create:safe_nbt` BLOCK TAG (full NBT), a SafeNbtWriter, or
// a PartialSafeNBT override. Most Create-addon control blocks never opt in, so radar
// controllers, datalinks, monitors and cannon mounts print BLANK and need rewiring.
//
// THE FIX: `create:safe_nbt` is datapack-driven — tag the control blocks and they
// print with saveWithFullMetadata. Works in survival schematicannon for everyone.
//
// DELIBERATE EXCLUSIONS (do not add):
//  - Inventory-holding blocks (autocannon breech, ammo containers, lectern w/ stored
//    items): schematicannon doesn't charge materials for BE contents -> free-item dupe.
//  - create_radar:radar_bearing: re-assembles fine on its own, and its BE carries a
//    `creative` flag a schematic could smuggle in.
//  - create_tweaked_controllers:tweaked_lectern_controller: already survives natively
//    (it implements writeSafe incl. its ControllerData).
//
// KNOWN STALE-BUT-HARMLESS on offset paste: monitor Controller/radarPos and mount
// CannonYaw/CannonPitch are absolute/runtime values — blocks re-scan on update;
// datalink TargetOffset is RELATIVE so links transplant cleanly.

ServerEvents.tags('block', e => {
  e.add('create:safe_nbt', [
    // create_radar: the "rewire everything" pain points — angle limits, link targets,
    // monitor filters now survive printing.
    'create_radar:auto_yaw_controller',
    'create_radar:auto_pitch_controller',
    'create_radar:fire_controller',
    'create_radar:data_link',
    'create_radar:monitor',
    // Create Big Cannons: mount keeps its yaw/pitch (stale-but-harmless runtime state).
    'createbigcannons:cannon_mount'
  ])
})
