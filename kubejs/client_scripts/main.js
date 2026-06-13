// Create-WAR :: client scripts entry point
// Runs only on the client. Use for tooltip overrides, JEI/EMI hiding,
// keybind helpers, and lang adjustments.
//
// API reference: https://kubejs.com/wiki/client-scripts

console.info('[Create-WAR] client_scripts loaded')

// === Tooltip clarifications for duplicate-named items ===
// The KubeJS 2101 tooltip API for NeoForge 1.21.1 uses ItemEvents.tooltip
// in some builds and JEIEvents/EMIEvents bridges in others. Confirm the exact
// signature against your installed kubejs-neoforge-2101.x build before adding
// tooltip rules here. Stub is left empty intentionally so this file loads
// clean. To re-add: find the event name in kubejs/console (type 'help events')
// and wrap the lines below.
//
// Examples to adapt once the right event name is found:
//   - quark:chute              -> "(Quark — item conveyor)"
//   - supplementaries:speedometer -> "(Supplementaries — player speed)"
//   - dndecor:belt             -> "(Decorative leather strap)"
