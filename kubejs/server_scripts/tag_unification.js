// Create-WAR :: cross-mod tag bridges
//
// AlmostUnified handles most ingot/dust/plate unification via standard
// c:ingots/<material> tags. This file adds custom tag aliases for things
// AlmostUnified doesn't catch.
//
// Pattern:
//   ServerEvents.tags('item', e => { e.add('c:tag/name', 'modid:item_id') })
//   ServerEvents.tags('block', e => { e.add('c:tag/name', 'modid:block_id') })

ServerEvents.tags('item', e => {
  // Example: add Air Wars titanium to a unified titanium ingot tag
  // (currently only Air Wars has titanium — but if another mod adds it, this future-proofs)
  // e.add('c:ingots/titanium', 'create_the_air_wars:titaniumingot')

  // Example: unify sulfur from Air Wars + future mods
  // e.add('c:ores/sulfur', 'create_the_air_wars:sulfur_ore')
  // e.add('c:ores/sulfur', 'create_the_air_wars:deepdlatesulfurore')
})

ServerEvents.tags('block', e => {
  // Example: unified hostile-mob-spawnable blocks for civilis_minecolonies
  // e.add('civil:mob_spawnable', '#minecraft:dirt')
})
