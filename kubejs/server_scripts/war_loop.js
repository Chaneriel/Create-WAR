// Create-WAR :: war-loop server-side helpers
//
// Bounty system v1 — Numismatics-backed escrow.
// Coin values (Spurs equivalent, verified from Coin.class bytecode):
//   spur=1, bevel=8, sprocket=16, cog=64, crown=512, sun=4096
//
// Commands:
//   /war bounty post <player> <amount> [coin]   default coin = spur
//   /war bounty cancel <player>                 cancels YOUR bounty on target (10% fee)
//   /war bounty list                            board of all targets
//   /war bounty list <player>                   detail for one target
//   /war bounty mine                            bounties YOU've posted
//
// Storage: server.persistentData[LEDGER_KEY] as a JSON string.
// Expiry: lazy — checked on /war bounty * commands and on player login.
//
// FIXED 2026-06-12 (audit follow-up — the system had never successfully registered):
//   1. Arguments.INTEGER.create(event, 1) -> create(event): the installed KubeJS
//      2101.7.2 ArgumentTypeWrapper has only the 1-arg overload (bytecode-verified);
//      the 2-arg call threw at registration and killed the whole /bounty tree.
//   2. The argument-wrapper holder was destructured inside the commandRegistry
//      callback but used by top-level executors at command time (out of scope ->
//      ReferenceError). Now hoisted to file scope (ARGS).
//   3. "(1 Bevel)" minimum-bounty text was wrong (64 spurs = 1 Cog) — now computed.
//   4. Corrupt-ledger parse no longer destroys escrow silently: raw string is
//      quarantined under a timestamped key before resetting.
//   5. Change-making now breaks the SMALLEST sufficient coin (was: largest first —
//      a Sun could be broken for a 5-spur shortfall).
//   6. Kill payouts ignore fake players (Create deployers etc.) so automated kills
//      can't consume bounties.

const COIN_VALUES = { spur: 1, bevel: 8, sprocket: 16, cog: 64, crown: 512, sun: 4096 }
const COIN_IDS_HIGH_TO_LOW = ['sun', 'crown', 'cog', 'sprocket', 'bevel', 'spur']
const COIN_ITEM = (c) => 'numismatics:' + c

const BOUNTY_TTL_MS = 3 * 24 * 60 * 60 * 1000  // 3 days (Create-WAR: faster board turnover for a small group)
const BOUNTY_MIN_SPURS = 64                     // 1 Cog (Create-WAR: raised from 8 so a bounty is a meaningful signal)
const BOUNTY_CANCEL_REFUND = 0.9                // 90% refund, 10% destroyed
const LEDGER_KEY = 'createwar_bounties_v1'

// Argument-wrapper holder, assigned during command registration and used by the
// executors at command time (file scope on purpose — see FIXED note 2).
let ARGS = null

// ---- ledger persistence ----

function loadLedger(server) {
  const data = server.persistentData
  const raw = data.contains(LEDGER_KEY) ? data.getString(LEDGER_KEY) : ''
  if (!raw || raw.length === 0) return {}
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('[Create-WAR] Bounty ledger parse failed — quarantining corrupt ledger: ' + e)
    try { data.putString(LEDGER_KEY + '_corrupt_' + Date.now(), raw) } catch (e2) {}
    return {}
  }
}

function saveLedger(server, ledger) {
  server.persistentData.putString(LEDGER_KEY, JSON.stringify(ledger))
}

// ---- coin manipulation ----

function countCoins(player, coinId) {
  let total = 0
  const items = player.inventory.allItems
  for (let i = 0; i < items.length; i++) {
    const stack = items[i]
    if (!stack.isEmpty() && stack.id === COIN_ITEM(coinId)) total += stack.count
  }
  return total
}

function getPlayerSpurs(player) {
  let total = 0
  COIN_IDS_HIGH_TO_LOW.forEach(c => { total += countCoins(player, c) * COIN_VALUES[c] })
  return total
}

function removeCoinsExact(player, coinId, count) {
  let remaining = count
  const items = player.inventory.allItems
  for (let i = 0; i < items.length && remaining > 0; i++) {
    const stack = items[i]
    if (!stack.isEmpty() && stack.id === COIN_ITEM(coinId)) {
      const take = Math.min(stack.count, remaining)
      stack.shrink(take)
      remaining -= take
    }
  }
  return count - remaining
}

// Pay `spurs` worth from inventory. Takes smallest coins first, then breaks the
// SMALLEST sufficient larger coin and gives change. Returns true if fully paid.
function takeCoins(player, spurs) {
  if (getPlayerSpurs(player) < spurs) return false
  let remaining = spurs
  const ascending = COIN_IDS_HIGH_TO_LOW.slice().reverse()
  for (let i = 0; i < ascending.length && remaining > 0; i++) {
    const coinId = ascending[i]
    const value = COIN_VALUES[coinId]
    if (value > remaining) continue
    const want = Math.floor(remaining / value)
    const have = countCoins(player, coinId)
    const taken = removeCoinsExact(player, coinId, Math.min(want, have))
    remaining -= taken * value
  }
  if (remaining === 0) return true
  // Break the smallest coin that covers the remainder (ascending search).
  for (let i = 0; i < ascending.length; i++) {
    const coinId = ascending[i]
    const value = COIN_VALUES[coinId]
    if (value < remaining) continue
    if (countCoins(player, coinId) > 0) {
      removeCoinsExact(player, coinId, 1)
      const change = value - remaining
      if (change > 0) giveCoins(player, change)
      return true
    }
  }
  return false
}

function giveCoins(player, spurs) {
  let remaining = spurs
  COIN_IDS_HIGH_TO_LOW.forEach(coinId => {
    const value = COIN_VALUES[coinId]
    const count = Math.floor(remaining / value)
    if (count > 0) {
      const stack = Item.of(COIN_ITEM(coinId), count)
      player.give(stack)
      remaining -= count * value
    }
  })
}

function formatSpurs(spurs) {
  if (spurs === 0) return '0 Spurs'
  const parts = []
  let remaining = spurs
  COIN_IDS_HIGH_TO_LOW.forEach(coinId => {
    const v = COIN_VALUES[coinId]
    const c = Math.floor(remaining / v)
    if (c > 0) {
      const name = coinId.charAt(0).toUpperCase() + coinId.slice(1)
      parts.push(c + ' ' + name + (c === 1 ? '' : 's'))
      remaining -= c * v
    }
  })
  return parts.join(', ')
}

function formatTimeLeft(expiresAt) {
  const ms = expiresAt - Date.now()
  if (ms <= 0) return 'expired'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms / (60 * 60 * 1000)) % 24)
  if (days > 0) return days + 'd ' + hours + 'h'
  const minutes = Math.floor((ms / (60 * 1000)) % 60)
  return hours + 'h ' + minutes + 'm'
}

// ---- expiry sweep (lazy) ----
// For every bounty whose expiry has passed: refund 100% to the poster if
// online, otherwise queue for next login. Returns sweep summary.
function sweepExpired(server) {
  const ledger = loadLedger(server)
  const now = Date.now()
  let refundedCount = 0
  Object.keys(ledger).forEach(targetKey => {
    const remaining = []
    ledger[targetKey].forEach(b => {
      if (b.expiresAt > now) {
        remaining.push(b)
      } else {
        refundExpired(server, b)
        refundedCount += 1
      }
    })
    if (remaining.length === 0) delete ledger[targetKey]
    else ledger[targetKey] = remaining
  })
  if (refundedCount > 0) saveLedger(server, ledger)
  return refundedCount
}

function refundExpired(server, bounty) {
  const poster = server.playerList.getPlayer(java.util.UUID.fromString(bounty.posterUuid))
  if (poster) {
    giveCoins(poster, bounty.amountSpurs)
    poster.tell(Text.gold('[BOUNTY] ').append(Text.white('Your ' + formatSpurs(bounty.amountSpurs) + ' bounty on ' + bounty.targetName + ' expired and was refunded.')))
  } else {
    queuePendingRefund(server, bounty)
  }
}

// Pending refunds for offline posters — handed out on login.
const PENDING_REFUNDS_KEY = 'createwar_bounty_pending_refunds_v1'

function loadPendingRefunds(server) {
  const data = server.persistentData
  const raw = data.contains(PENDING_REFUNDS_KEY) ? data.getString(PENDING_REFUNDS_KEY) : ''
  if (!raw || raw.length === 0) return {}
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('[Create-WAR] Pending-refund parse failed — quarantining: ' + e)
    try { data.putString(PENDING_REFUNDS_KEY + '_corrupt_' + Date.now(), raw) } catch (e2) {}
    return {}
  }
}

function savePendingRefunds(server, refunds) {
  server.persistentData.putString(PENDING_REFUNDS_KEY, JSON.stringify(refunds))
}

function queuePendingRefund(server, bounty) {
  const refunds = loadPendingRefunds(server)
  if (!refunds[bounty.posterUuid]) refunds[bounty.posterUuid] = []
  refunds[bounty.posterUuid].push({
    amountSpurs: bounty.amountSpurs,
    targetName: bounty.targetName,
    reason: 'expired'
  })
  savePendingRefunds(server, refunds)
}

function deliverPendingRefunds(player) {
  const refunds = loadPendingRefunds(player.server)
  const uuid = player.uuid.toString()
  const mine = refunds[uuid]
  if (!mine || mine.length === 0) return
  mine.forEach(r => {
    giveCoins(player, r.amountSpurs)
    player.tell(Text.gold('[BOUNTY] ').append(Text.white('Refunded ' + formatSpurs(r.amountSpurs) + ' (' + r.reason + ' bounty on ' + r.targetName + ').')))
  })
  delete refunds[uuid]
  savePendingRefunds(player.server, refunds)
}

// ---- commands ----

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  ARGS = Arguments  // hoist for the executors (see FIXED note 2)

  // Unified /war root (command streamlining 2026-06-12): Brigadier merges same-named
  // root literals, so this 'war' composes with the framework's /war tree — bounty
  // lands as /war bounty without touching the jar.
  event.register(
    Commands.literal('war')
      .then(Commands.literal('bounty')
        .then(Commands.literal('post')
          .then(Commands.argument('target', Arguments.PLAYER.create(event))
            .then(Commands.argument('amount', Arguments.INTEGER.create(event))
              .executes(ctx => doBountyPost(ctx, 'spur'))
              .then(Commands.argument('coin', Arguments.STRING.create(event))
                .executes(ctx => doBountyPost(ctx, ARGS.STRING.getResult(ctx, 'coin')))))))
        .then(Commands.literal('cancel')
          .then(Commands.argument('target', Arguments.PLAYER.create(event))
            .executes(ctx => doBountyCancel(ctx))))
        .then(Commands.literal('list')
          .executes(ctx => doBountyListAll(ctx))
          .then(Commands.argument('target', Arguments.PLAYER.create(event))
            .executes(ctx => doBountyListOne(ctx))))
        .then(Commands.literal('mine')
          .executes(ctx => doBountyMine(ctx))))
  )
})

function doBountyPost(ctx, coinIdRaw) {
  const src = ctx.source
  const poster = src.player
  if (!poster) { src.sendFailure(Text.red('Bounties must be posted by a player.')); return 0 }
  const target = ARGS.PLAYER.getResult(ctx, 'target')
  const amount = ARGS.INTEGER.getResult(ctx, 'amount')
  const coinId = String(coinIdRaw).toLowerCase()

  if (!COIN_VALUES[coinId]) {
    src.sendFailure(Text.red('Unknown coin "' + coinId + '". Valid: ' + Object.keys(COIN_VALUES).join(', ')))
    return 0
  }
  if (amount <= 0) {
    src.sendFailure(Text.red('Amount must be positive.'))
    return 0
  }
  if (poster.uuid.toString() === target.uuid.toString()) {
    src.sendFailure(Text.red('You cannot post a bounty on yourself.'))
    return 0
  }
  const spurs = amount * COIN_VALUES[coinId]
  if (spurs < BOUNTY_MIN_SPURS) {
    src.sendFailure(Text.red('Minimum bounty is ' + BOUNTY_MIN_SPURS + ' Spurs (' + formatSpurs(BOUNTY_MIN_SPURS) + '). You offered ' + spurs + ' Spurs.'))
    return 0
  }
  if (!takeCoins(poster, spurs)) {
    src.sendFailure(Text.red('Insufficient coins. You have ' + formatSpurs(getPlayerSpurs(poster)) + ', need ' + formatSpurs(spurs) + '.'))
    return 0
  }

  sweepExpired(src.server)
  const ledger = loadLedger(src.server)
  const key = target.uuid.toString()
  if (!ledger[key]) ledger[key] = []
  ledger[key].push({
    posterUuid: poster.uuid.toString(),
    posterName: poster.name.string,
    targetName: target.name.string,
    amountSpurs: spurs,
    postedAt: Date.now(),
    expiresAt: Date.now() + BOUNTY_TTL_MS
  })
  saveLedger(src.server, ledger)

  src.server.playerList.broadcastSystemMessage(
    Text.gold('[BOUNTY] ').append(Text.white(poster.name.string + ' posted ' + formatSpurs(spurs) + ' on ' + target.name.string + '.')),
    false
  )
  return 1
}

function doBountyCancel(ctx) {
  const src = ctx.source
  const poster = src.player
  if (!poster) { src.sendFailure(Text.red('Player only.')); return 0 }
  const target = ARGS.PLAYER.getResult(ctx, 'target')

  sweepExpired(src.server)
  const ledger = loadLedger(src.server)
  const key = target.uuid.toString()
  const arr = ledger[key] || []
  const idx = arr.findIndex(b => b.posterUuid === poster.uuid.toString())
  if (idx === -1) {
    src.sendFailure(Text.red('You have no active bounty on ' + target.name.string + '.'))
    return 0
  }
  const b = arr[idx]
  const refund = Math.floor(b.amountSpurs * BOUNTY_CANCEL_REFUND)
  const destroyed = b.amountSpurs - refund
  arr.splice(idx, 1)
  if (arr.length === 0) delete ledger[key]
  else ledger[key] = arr
  saveLedger(src.server, ledger)

  giveCoins(poster, refund)
  poster.tell(Text.gold('[BOUNTY] ').append(Text.white(
    'Cancelled bounty on ' + target.name.string + '. Refunded ' + formatSpurs(refund) + '; destroyed ' + formatSpurs(destroyed) + ' (10% fee).')))
  return 1
}

function doBountyListAll(ctx) {
  const src = ctx.source
  sweepExpired(src.server)
  const ledger = loadLedger(src.server)
  const targets = Object.keys(ledger)
  if (targets.length === 0) { src.sendSystemMessage(Text.gray('No active bounties.')); return 0 }
  src.sendSystemMessage(Text.gold('=== Bounty Board (' + targets.length + ' target' + (targets.length === 1 ? '' : 's') + ') ==='))
  targets.forEach(key => {
    const arr = ledger[key]
    const total = arr.reduce((s, b) => s + b.amountSpurs, 0)
    const name = arr[0].targetName
    src.sendSystemMessage(Text.white('  ' + name + ' — ' + formatSpurs(total) + ' (' + arr.length + ' poster' + (arr.length === 1 ? '' : 's') + ')'))
  })
  return 1
}

function doBountyListOne(ctx) {
  const src = ctx.source
  const target = ARGS.PLAYER.getResult(ctx, 'target')
  sweepExpired(src.server)
  const ledger = loadLedger(src.server)
  const arr = ledger[target.uuid.toString()] || []
  if (arr.length === 0) { src.sendSystemMessage(Text.gray('No active bounties on ' + target.name.string + '.')); return 0 }
  src.sendSystemMessage(Text.gold('=== Bounties on ' + target.name.string + ' ==='))
  arr.forEach(b => {
    src.sendSystemMessage(Text.white('  ' + b.posterName + ': ' + formatSpurs(b.amountSpurs) + ' (expires in ' + formatTimeLeft(b.expiresAt) + ')'))
  })
  return 1
}

function doBountyMine(ctx) {
  const src = ctx.source
  const me = src.player
  if (!me) { src.sendFailure(Text.red('Player only.')); return 0 }
  sweepExpired(src.server)
  const ledger = loadLedger(src.server)
  const mine = []
  Object.keys(ledger).forEach(key => {
    ledger[key].forEach(b => { if (b.posterUuid === me.uuid.toString()) mine.push(b) })
  })
  if (mine.length === 0) { src.sendSystemMessage(Text.gray('You have no active bounties.')); return 0 }
  src.sendSystemMessage(Text.gold('=== Your Active Bounties ==='))
  mine.forEach(b => {
    src.sendSystemMessage(Text.white('  on ' + b.targetName + ': ' + formatSpurs(b.amountSpurs) + ' (expires in ' + formatTimeLeft(b.expiresAt) + ')'))
  })
  return 1
}

// ---- PvP kill → payout ----

EntityEvents.death('minecraft:player', event => {
  const victim = event.entity
  const damageSource = event.source
  if (!damageSource) return
  const killer = damageSource.actual
  if (!killer || !killer.isPlayer()) return
  // Fake players (Create deployers, modded automation) must not claim bounties —
  // class-name heuristic covers FakePlayer subclasses AND Create's DeployerFakePlayer.
  try {
    if (String(killer.getClass().getName()).indexOf('FakePlayer') >= 0) return
  } catch (e) {}
  if (killer.uuid.toString() === victim.uuid.toString()) return  // suicide-via-damage edge case

  const server = victim.server
  sweepExpired(server)
  const ledger = loadLedger(server)
  const key = victim.uuid.toString()
  const arr = ledger[key]
  if (!arr || arr.length === 0) return

  const now = Date.now()
  let payout = 0
  const posters = []
  arr.forEach(b => {
    if (b.expiresAt > now) {
      payout += b.amountSpurs
      posters.push(b.posterName)
    }
  })
  delete ledger[key]
  saveLedger(server, ledger)

  if (payout === 0) return
  giveCoins(killer, payout)
  server.playerList.broadcastSystemMessage(
    Text.gold('[BOUNTY] ').append(Text.white(
      killer.name.string + ' claimed ' + formatSpurs(payout) + ' for killing ' + victim.name.string +
      ' (posted by ' + posters.join(', ') + ').')),
    false
  )
})

// ---- login: tip + deliver any pending refunds + sweep ----

PlayerEvents.loggedIn(e => {
  const player = e.player
  sweepExpired(player.server)
  deliverPendingRefunds(player)
  if (player.persistentData.contains('cwwar_joined')) return
  player.persistentData.putBoolean('cwwar_joined', true)
  player.tell(Text.gold('[Create-WAR] ').append(Text.white('You spawned at a random location — this is your persistent home spawn. Hide a stash, build smart, and use schematics to make rebuilds painless.')))
  player.tell(Text.gold('[Create-WAR] ').append(Text.gray('Economy: /war bounty post|cancel|list|mine — bounties paid in Numismatics coins.')))
})
