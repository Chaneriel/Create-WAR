// Create-WAR :: server scripts entry point
// This runs on world load + /reload. Use for recipe changes, item hiding, tag aliasing.
//
// Sub-files in server_scripts/ are auto-loaded. Keep this file for global imports
// and high-level docs; put concrete edits in:
//   - hide_duplicates.js    -> remove duplicate-block recipes
//   - tag_unification.js    -> add tag-based bridges between mods
//   - war_loop.js           -> custom server commands for the war workflow
//
// API reference: https://kubejs.com/wiki/server-scripts
console.info('[Create-WAR] server_scripts loaded')
