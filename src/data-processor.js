// Data Processing Module
const normalizeName = (name, metadata=undefined) => {
  if (metadata && metadata.team_names && metadata.team_names[name]) {
    return metadata.team_names[name].toLowerCase()
  }
  const aliases = {
    random256: "rsha256",
    b747: "praj",
    ghoulean: "js",
    jskingboo: "js",
    wiseguy: "arboursole",
    "ray of darkness": "rayofdarkness"
  };
  if (aliases[name]) {
    return aliases[name]
  }
  if (aliases[name.toLowerCase()]) {
    return aliases[name.toLowerCase()]
  }
  return name.toLowerCase()
};

// ELO configuration
let DEFAULT_ELO = 1500;
let FLOOR_ELO = null;
let HIGH_ELO = 1600;
let K = 50;
let K_HIGH_ELO = 15;

// Function to calculate ELO
const calculateELO = (currentElo, opponentElo, outcome) => {
  let k = K
  if (HIGH_ELO && Math.min(currentElo, opponentElo) >= HIGH_ELO) {
     k = K_HIGH_ELO;
  }
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const elo = Math.round(currentElo + k * (outcome - expectedScore));
  return FLOOR_ELO ? Math.max(elo, FLOOR_ELO) : elo
};

// Function to process games and update ELOs
const processGames = (games, elos, weekIndex, metadata=undefined) => {
  const updatedElos = { ...elos };

  games.forEach((game) => {
    const winner = normalizeName(game.w, metadata);
    const loser = normalizeName(game.l, metadata);

    // Initialize ELOs for new players
    if (!updatedElos[winner]) {
      updatedElos[winner] = {
        score: DEFAULT_ELO,
        history: new Array(weekIndex).fill(null),
      };
      updatedElos[winner].history[weekIndex - 1] = DEFAULT_ELO;
    }
    if (!updatedElos[loser]) {
      updatedElos[loser] = {
        score: DEFAULT_ELO,
        history: new Array(weekIndex).fill(null),
      };
      updatedElos[loser].history[weekIndex - 1] = DEFAULT_ELO;
    }

    // Calculate new ELOs
    updatedElos[winner].score = calculateELO(
      updatedElos[winner].score,
      updatedElos[loser].score,
      1
    ); // Winner's ELO
    updatedElos[loser].score = calculateELO(
      updatedElos[loser].score,
      updatedElos[winner].score,
      0
    ); // Loser's ELO

    // Save the ELO for this week
    updatedElos[winner].history[weekIndex] = updatedElos[winner].score;
    updatedElos[loser].history[weekIndex] = updatedElos[loser].score;
  });

  return updatedElos;
};

// Function to interpolate data
const interpolateData = (history) => {
  return history.map((elo, index) => {
    if (elo !== null) return elo; // Return existing value

    // Find the previous non-null value
    let prevIndex = index - 1;
    while (prevIndex >= 0 && history[prevIndex] === null) {
      prevIndex--;
    }

    // Find the next non-null value
    let nextIndex = index + 1;
    while (nextIndex < history.length && history[nextIndex] === null) {
      nextIndex++;
    }

    // If both surrounding indices are found, interpolate
    if (prevIndex >= 0 && nextIndex < history.length) {
      const prevElo = history[prevIndex];
      const nextElo = history[nextIndex];
      const weight = (index - prevIndex) / (nextIndex - prevIndex);
      return prevElo + weight * (nextElo - prevElo);
    }

    // If there's no valid value to interpolate with, remain null
    return null;
  });
};

// Update ELO configuration
const updateELOConfig = (config) => {
  DEFAULT_ELO = config.defaultElo || DEFAULT_ELO;
  FLOOR_ELO = config.floorElo || FLOOR_ELO;
  HIGH_ELO = config.highElo || HIGH_ELO;
  K = config.k || K;
  K_HIGH_ELO = config.kHighElo || K_HIGH_ELO;
};

export { normalizeName, calculateELO, processGames, interpolateData, updateELOConfig };
