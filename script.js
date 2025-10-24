// Function to check for aliases
function checkForAlias(name) {
    const aliases = {
        "random256": "rsha256",
        "b747": "praj",
        "ghoulean": "js",
        "jskingboo": "js"
    }
    return aliases[name] ? aliases[name] : name
}

// Function to calculate ELO
function calculateELO(currentElo, opponentElo, outcome) {
  const K = 50; // K factor, https://pokemonshowdown.com/pages/ladderhelp
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  return Math.round(currentElo + K * (outcome - expectedScore));
}

// Function to process games and update ELOs
function processGames(games, elos, weekIndex) {
  games.forEach((game) => {
    const winner = checkForAlias(game.w.toLowerCase());
    const loser = checkForAlias(game.l.toLowerCase());

    // Initialize ELOs for new players
    if (!elos[winner]) {
      elos[winner] = {
        score: 1500,
        history: new Array(weekIndex).fill(null),
      };
      elos[winner].history[weekIndex - 1] = 1500;
    }
    if (!elos[loser]) {
      elos[loser] = {
        score: 1500,
        history: new Array(weekIndex).fill(null),
      };
      elos[loser].history[weekIndex - 1] = 1500;
    }

    // Calculate new ELOs
    elos[winner].score = calculateELO(elos[winner].score, elos[loser].score, 1); // Winner's ELO
    elos[loser].score = calculateELO(elos[loser].score, elos[winner].score, 0); // Loser's ELO

    // Save the ELO for this week
    elos[winner].history[weekIndex] = elos[winner].score;
    elos[loser].history[weekIndex] = elos[loser].score;
  });
}

function interpolateData(history) {
  const interpolated = history.map((elo, index) => {
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

  return interpolated;
}

// Function to fetch and parse JSON data
function fetchData(url) {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to load data");
    return response.json();
  });
}

// Function to initialize ELO tracking and create the chart
function initializeELOChart(seasons) {
  let x_axis = [""];
  let elos = {};
  for (const [seasonIndex, season] of seasons.entries()) {
    console.log("season", seasonIndex + 1, season);
    let weeks = [];
    season.weeks.forEach((weekGames, weekIndex) => {
      let x_axis_index = x_axis.length + weekIndex;
      weeks.push(`s${seasonIndex + 1}w${weekIndex + 1}`);
      processGames(weekGames, elos, x_axis_index);
    });

    season.playoffs.forEach((playoffGames, playoffIndex) => {
      let x_axis_index = x_axis.length + season.weeks.length + playoffIndex;
      weeks.push(`s${seasonIndex + 1}p${playoffIndex + 1}`);
      processGames(playoffGames, elos, x_axis_index);
    });

    x_axis = x_axis.concat(weeks);
  }

  createChart(x_axis, elos);
}

// Function to create the chart
function createChart(weeks, elos) {
  const datasets = Object.entries(elos).map(([player, { history }]) => {
    // Filter out weeks where the player did not participate (i.e., where history is null)
    const filteredHistory = history.map((elo, index) => {
      return elo !== null ? elo : undefined; // Use undefined for missing data
    });

    return {
      label: player,
      data: filteredHistory,
      borderColor: getRandomColor(),
      fill: false,
      spanGaps: true,
    };
  });

  const y_min =
    Math.round(
      (Math.min(
        ...Object.values(elos).flatMap((player) =>
          player.history.filter(Boolean)
        )
      ) -
        50) /
        100
    ) * 100;
  const y_max =
    Math.round(
      (Math.max(
        ...Object.values(elos).flatMap((player) =>
          player.history.filter(Boolean)
        )
      ) +
        50) /
        100
    ) * 100;

  const ctx = document.getElementById("eloChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: weeks,
      datasets: datasets,
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          grid: { display: false },
          beginAtZero: true,
          min: y_min,
          max: y_max,
          ticks: {
            callback: function (value) {
              return value; // returns the value without formatting
            },
          },
        },
      },
      elements: {
        line: {
          tension: 0.4, // Smoother curves; set to 0 for straight lines
        },
      },
    },
  });

  let currently_selected = undefined;
  function select_line(event) {
    const activePoints = chart.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      false
    );

    if (activePoints.length) {
      const clickedDatasetIndex = activePoints[0].datasetIndex; // Identify clicked dataset

      // Deselect if double-clicking...
      if (clickedDatasetIndex === currently_selected) {
        deselect_line();
      } else {
        currently_selected = clickedDatasetIndex;
        // Fade out other lines
        chart.data.datasets.forEach((dataset, index) => {
          dataset.borderWidth = index === clickedDatasetIndex ? 3 : 0.5; // Thicker line for the selected dataset
        });
      }
      chart.update(); // Redraw the chart
    } else {
      // ... or if just clicking anywhere on the canvas.
      if (currently_selected) {
        deselect_line();
        chart.update();
      }
    }
  }

  function deselect_line() {
    currently_selected = undefined;
    chart.data.datasets.forEach((dataset) => {
      dataset.borderWidth = undefined; // Reset border width
    });
  }

  // Add event listeners for click and mouseout
  ctx.canvas.addEventListener("click", select_line);
}

// Function to get a random color for line
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Main function to run the application
function main() {
  const urls = ["./data/s1.json", "./data/s2.json", "./data/s3.json"]; // List of JSON files

  // Fetch all data files
  Promise.all(urls.map(fetchData))
    .then((data) => {
      initializeELOChart(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Run the main function
main();
