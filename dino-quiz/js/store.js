(function (root) {
  "use strict";

  // Single source of truth for players, their progression profiles, and the
  // leaderboard. Merges the three historical sources (server file, localStorage
  // cache, static seed in player-data.js) exactly once at load(); after that,
  // the in-memory `data` object is authoritative and every mutation writes the
  // localStorage cache immediately for crash safety.

  const LEADERBOARD_STORAGE_KEY = "dinoQuizLeaderboard";
  const PLAYER_REGISTRY_STORAGE_KEY = "dinoQuizPlayers";
  const DATA_VERSION = 2;
  const SAVED_RESULT_LIMIT = 25;
  const PLAY_DATES_LIMIT = 60;
  const REDIG_LIMIT = 10;
  const REDIG_MAX_MISSES = 3;
  const DATA_STORAGE_KEY = "dinoQuizData";

  function defaultProfile() {
    return {
      xp: 0,
      coins: 0,
      unlocks: [],
      badges: {},
      discovered: [],
      redig: [],
      playDates: [],
      expeditions: {},
      duels: { won: 0, played: 0 }
    };
  }

  // Sort: higher score first, then higher accuracy, then fewer hints.
  function compareEntries(a, b) {
    return b.score - a.score || b.accuracy - a.accuracy || a.hints - b.hints;
  }

  function uniqueList(list) {
    return Array.from(new Set(Array.isArray(list) ? list : []));
  }

  function normalizeProfile(raw) {
    const base = defaultProfile();
    if (!raw || typeof raw !== "object") return base;
    return {
      xp: Number(raw.xp) || 0,
      coins: Number(raw.coins) || 0,
      unlocks: uniqueList(raw.unlocks),
      badges: raw.badges && typeof raw.badges === "object" ? { ...raw.badges } : {},
      discovered: uniqueList(raw.discovered),
      redig: Array.isArray(raw.redig) ? raw.redig.filter((item) => item && item.slug).slice(0, REDIG_LIMIT) : [],
      playDates: uniqueList(raw.playDates).slice(-PLAY_DATES_LIMIT),
      expeditions: raw.expeditions && typeof raw.expeditions === "object" ? { ...raw.expeditions } : {},
      duels: {
        won: Number(raw.duels && raw.duels.won) || 0,
        played: Number(raw.duels && raw.duels.played) || 0
      }
    };
  }

  // Merge two profiles for the same player without losing offline progress:
  // scalars take the max, collections take the union.
  function mergeProfiles(a, b) {
    const left = normalizeProfile(a);
    const right = normalizeProfile(b);
    const badges = { ...right.badges };
    Object.entries(left.badges).forEach(([id, date]) => {
      badges[id] = badges[id] ? (badges[id] < date ? badges[id] : date) : date;
    });
    const redigMap = new Map();
    [...right.redig, ...left.redig].forEach((item) => {
      const existing = redigMap.get(item.slug);
      if (!existing || (Number(item.misses) || 0) > (Number(existing.misses) || 0)) {
        redigMap.set(item.slug, { ...item });
      }
    });
    return {
      xp: Math.max(left.xp, right.xp),
      coins: Math.max(left.coins, right.coins),
      unlocks: uniqueList([...left.unlocks, ...right.unlocks]),
      badges,
      discovered: uniqueList([...left.discovered, ...right.discovered]),
      redig: Array.from(redigMap.values()).slice(0, REDIG_LIMIT),
      playDates: uniqueList([...left.playDates, ...right.playDates]).slice(-PLAY_DATES_LIMIT),
      expeditions: { ...right.expeditions, ...left.expeditions },
      duels: {
        won: Math.max(left.duels.won, right.duels.won),
        played: Math.max(left.duels.played, right.duels.played)
      }
    };
  }

  function createDinoStore(deps) {
    const {
      cleanPlayerName,
      readJsonStorage,
      writeJsonStorage,
      seed,
      todayDisplay,
      todayISO
    } = deps;

    const displayDate = todayDisplay || (() => new Date().toLocaleDateString());
    const isoDate = todayISO || (() => new Date().toISOString().slice(0, 10));

    let data = { version: DATA_VERSION, players: [], leaderboard: [] };
    let dirty = false;
    let serverAvailable = false;

    function dedupeLeaderboard(entries) {
      const seenIds = new Set();
      return (Array.isArray(entries) ? entries : []).filter((entry) => {
        if (!entry || typeof entry !== "object") return false;
        const id = entry.id || `${entry.name}-${entry.score}-${entry.date}`;
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      });
    }

    function normalizeEntry(entry) {
      return {
        ...entry,
        name: cleanPlayerName(entry.name || ""),
        score: Number(entry.score) || 0,
        accuracy: Number(entry.accuracy) || 0,
        hints: Number(entry.hints) || 0
      };
    }

    // Fold a raw {players, leaderboard} document into the canonical in-memory
    // shape. Called with seed, then localStorage, then server (last wins).
    function ingest(raw, { authoritative }) {
      if (!raw || typeof raw !== "object") return;
      const incomingPlayers = Array.isArray(raw.players) ? raw.players : [];
      const incomingBoard = Array.isArray(raw.leaderboard) ? raw.leaderboard : [];

      // Merge players by lowercased name, unioning profiles.
      const byName = new Map();
      data.players.forEach((player) => byName.set(player.name.toLowerCase(), player));
      incomingPlayers.forEach((rawPlayer) => {
        const name = cleanPlayerName(rawPlayer.name || "");
        if (!name) return;
        const key = name.toLowerCase();
        const existing = byName.get(key);
        if (existing) {
          existing.profile = mergeProfiles(existing.profile, rawPlayer.profile);
          if (authoritative && rawPlayer.firstSeen) existing.firstSeen = rawPlayer.firstSeen;
        } else {
          byName.set(key, {
            name,
            firstSeen: rawPlayer.firstSeen || displayDate(),
            profile: normalizeProfile(rawPlayer.profile)
          });
        }
      });
      data.players = Array.from(byName.values());

      // Merge leaderboard entries by id.
      data.leaderboard = dedupeLeaderboard([...data.leaderboard, ...incomingBoard.map(normalizeEntry)])
        .sort(compareEntries)
        .slice(0, SAVED_RESULT_LIMIT);
    }

    // Ensure every player who has a leaderboard entry also has a player record.
    function backfillPlayersFromBoard() {
      const byName = new Map();
      data.players.forEach((player) => byName.set(player.name.toLowerCase(), player));
      data.leaderboard.forEach((entry) => {
        const name = cleanPlayerName(entry.name || "");
        if (!name) return;
        const key = name.toLowerCase();
        if (!byName.has(key)) {
          const player = { name, firstSeen: entry.date || displayDate(), profile: defaultProfile() };
          byName.set(key, player);
          data.players.push(player);
        }
      });
    }

    function persistLocal() {
      writeJsonStorage(DATA_STORAGE_KEY, data);
      // Keep the legacy keys in sync so nothing else breaks and old tabs still read.
      writeJsonStorage(LEADERBOARD_STORAGE_KEY, data.leaderboard);
      writeJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, data.players.map((p) => ({ name: p.name, firstSeen: p.firstSeen })));
    }

    function markDirty() {
      dirty = true;
      persistLocal();
    }

    function canUseServer() {
      if (typeof window === "undefined" || !window.location) return false;
      return window.location.protocol === "http:" || window.location.protocol === "https:";
    }

    function readLocalDocument() {
      const modern = readJsonStorage(DATA_STORAGE_KEY, null);
      if (modern && Array.isArray(modern.players) && Array.isArray(modern.leaderboard)) {
        return modern;
      }
      // Fall back to the legacy split keys from before the store existed.
      const legacyBoard = readJsonStorage(LEADERBOARD_STORAGE_KEY, []);
      const legacyPlayers = readJsonStorage(PLAYER_REGISTRY_STORAGE_KEY, []);
      return {
        players: Array.isArray(legacyPlayers) ? legacyPlayers : [],
        leaderboard: Array.isArray(legacyBoard) ? legacyBoard : []
      };
    }

    async function load() {
      data = { version: DATA_VERSION, players: [], leaderboard: [] };
      ingest(seed || { players: [], leaderboard: [] }, { authoritative: false });
      ingest(readLocalDocument(), { authoritative: false });

      if (canUseServer()) {
        try {
          const response = await fetch("/api/leaderboard", { cache: "no-store" });
          if (response.ok) {
            ingest(await response.json(), { authoritative: true });
            serverAvailable = true;
          }
        } catch (error) {
          serverAvailable = false;
        }
      }

      backfillPlayersFromBoard();
      data.version = DATA_VERSION;
      persistLocal();
      return { serverAvailable };
    }

    async function save() {
      persistLocal();
      dirty = false;
      if (!canUseServer()) {
        return { ok: false, reason: "no-server" };
      }
      try {
        const response = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: DATA_VERSION, players: data.players, leaderboard: data.leaderboard })
        });
        if (!response.ok) throw new Error("Save failed.");
        ingest(await response.json(), { authoritative: true });
        backfillPlayersFromBoard();
        serverAvailable = true;
        persistLocal();
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: "network" };
      }
    }

    // --- Queries -----------------------------------------------------------

    function getPlayers() {
      return [...data.players].sort((a, b) => a.name.localeCompare(b.name));
    }

    function getPlayer(name) {
      const key = cleanPlayerName(name || "").toLowerCase();
      return data.players.find((player) => player.name.toLowerCase() === key) || null;
    }

    function getLeaderboard(limit) {
      const sorted = [...data.leaderboard].sort(compareEntries);
      return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
    }

    function playerScoreCount(name) {
      const key = cleanPlayerName(name || "").toLowerCase();
      return data.leaderboard.filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() === key).length;
    }

    function isDirty() {
      return dirty;
    }

    function isServerAvailable() {
      return serverAvailable;
    }

    // --- Mutations ---------------------------------------------------------

    function upsertPlayer(name) {
      const cleanName = cleanPlayerName(name || "");
      if (!cleanName) return null;
      let player = getPlayer(cleanName);
      if (!player) {
        player = { name: cleanName, firstSeen: displayDate(), profile: defaultProfile() };
        data.players.push(player);
        markDirty();
      }
      if (!player.profile) {
        player.profile = defaultProfile();
        markDirty();
      }
      return player;
    }

    function removePlayer(name) {
      const key = cleanPlayerName(name || "").toLowerCase();
      data.players = data.players.filter((player) => player.name.toLowerCase() !== key);
      data.leaderboard = data.leaderboard.filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key);
      markDirty();
    }

    function clearScores(name) {
      const key = cleanPlayerName(name || "").toLowerCase();
      data.leaderboard = data.leaderboard.filter((entry) => cleanPlayerName(entry.name || "").toLowerCase() !== key);
      markDirty();
    }

    function addResult(entry) {
      const normalized = normalizeEntry(entry);
      data.leaderboard = dedupeLeaderboard([...data.leaderboard, normalized])
        .sort(compareEntries)
        .slice(0, SAVED_RESULT_LIMIT);
      markDirty();
      return data.leaderboard.some((item) => item.id === normalized.id);
    }

    // Run a mutator against a player's profile, then persist. Returns whatever
    // the mutator returns (defaults to the profile).
    function withProfile(name, mutate) {
      const player = upsertPlayer(name);
      if (!player) return null;
      const result = mutate(player.profile);
      markDirty();
      return result === undefined ? player.profile : result;
    }

    function addXp(name, points) {
      return withProfile(name, (profile) => {
        profile.xp += Math.max(0, Number(points) || 0);
        return profile.xp;
      });
    }

    function addCoins(name, amount) {
      return withProfile(name, (profile) => {
        profile.coins += Math.max(0, Number(amount) || 0);
        return profile.coins;
      });
    }

    function spendCoins(name, amount) {
      const cost = Math.max(0, Number(amount) || 0);
      const player = getPlayer(name);
      if (!player || player.profile.coins < cost) return false;
      return withProfile(name, (profile) => {
        profile.coins -= cost;
        return true;
      });
    }

    function unlock(name, id) {
      return withProfile(name, (profile) => {
        if (!profile.unlocks.includes(id)) profile.unlocks.push(id);
      });
    }

    function hasUnlock(name, id) {
      const player = getPlayer(name);
      return Boolean(player && player.profile.unlocks.includes(id));
    }

    function awardBadge(name, id) {
      return withProfile(name, (profile) => {
        if (profile.badges[id]) return false;
        profile.badges[id] = isoDate();
        return true;
      });
    }

    function discover(name, slug) {
      return withProfile(name, (profile) => {
        if (profile.discovered.includes(slug)) return false;
        profile.discovered.push(slug);
        return true;
      });
    }

    function recordPlayDate(name) {
      return withProfile(name, (profile) => {
        const today = isoDate();
        if (!profile.playDates.includes(today)) {
          profile.playDates.push(today);
          profile.playDates = profile.playDates.slice(-PLAY_DATES_LIMIT);
        }
        return profile.playDates.length;
      });
    }

    function recordExpedition(name, themeId) {
      return withProfile(name, (profile) => {
        profile.expeditions[isoDate()] = themeId;
      });
    }

    function recordDuel(name, won) {
      return withProfile(name, (profile) => {
        profile.duels.played += 1;
        if (won) profile.duels.won += 1;
        return profile.duels;
      });
    }

    function enqueueRedig(name, slug) {
      return withProfile(name, (profile) => {
        const existing = profile.redig.find((item) => item.slug === slug);
        if (existing) {
          existing.misses = (Number(existing.misses) || 0) + 1;
          existing.lastSeen = isoDate();
          // A re-dig appears at misses 1 and 2; a third miss retires it so the
          // queue never turns into homework the player keeps failing.
          if (existing.misses >= REDIG_MAX_MISSES) {
            profile.redig = profile.redig.filter((item) => item.slug !== slug);
          }
        } else {
          profile.redig.unshift({ slug, misses: 1, lastSeen: isoDate() });
          profile.redig = profile.redig.slice(0, REDIG_LIMIT);
        }
      });
    }

    function dequeueRedig(name, slug) {
      return withProfile(name, (profile) => {
        profile.redig = profile.redig.filter((item) => item.slug !== slug);
      });
    }

    return {
      load,
      save,
      compareEntries,
      getPlayers,
      getPlayer,
      getLeaderboard,
      playerScoreCount,
      isDirty,
      isServerAvailable,
      upsertPlayer,
      removePlayer,
      clearScores,
      addResult,
      addXp,
      addCoins,
      spendCoins,
      unlock,
      hasUnlock,
      awardBadge,
      discover,
      recordPlayDate,
      recordExpedition,
      recordDuel,
      enqueueRedig,
      dequeueRedig,
      // exposed for the smoke test
      _defaultProfile: defaultProfile,
      _mergeProfiles: mergeProfiles
    };
  }

  root.createDinoStore = createDinoStore;

  // Allow Node (smoke test) to require the factory as well.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createDinoStore, compareEntries, defaultProfile, mergeProfiles };
  }
})(typeof window !== "undefined" ? window : globalThis);
