// Data Processing Module
const checkForAlias = (name) => {
  const aliases = {
    random256: "rsha256",
    b747: "praj",
    ghoulean: "js",
    jskingboo: "js",
  };
  return aliases[name] ? aliases[name] : name;
};

// Function to calculate ELO
const calculateELO = (currentElo, opponentElo, outcome) => {
  const K = 50; // K factor, https://pokemonshowdown.com/pages/ladderhelp
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  return Math.round(currentElo + K * (outcome - expectedScore));
};

// Function to process games and update ELOs
const processGames = (games, elos, weekIndex) => {
  const updatedElos = { ...elos };

  games.forEach((game) => {
    const winner = checkForAlias(game.w.toLowerCase());
    const loser = checkForAlias(game.l.toLowerCase());

    // Initialize ELOs for new players
    if (!updatedElos[winner]) {
      updatedElos[winner] = {
        score: 1500,
        history: new Array(weekIndex).fill(null),
      };
      updatedElos[winner].history[weekIndex - 1] = 1500;
    }
    if (!updatedElos[loser]) {
      updatedElos[loser] = {
        score: 1500,
        history: new Array(weekIndex).fill(null),
      };
      updatedElos[loser].history[weekIndex - 1] = 1500;
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

export { checkForAlias, calculateELO, processGames, interpolateData };
