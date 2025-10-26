// Charting Module
// Function to get a random color for line
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to create chart datasets
const createDatasets = (elos) => {
  return Object.entries(elos).map(([player, { history }]) => {
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
};

// Function to calculate Y-axis min and max
const calculateYAxisRange = (elos) => {
  const allElos = Object.values(elos).flatMap((player) =>
    player.history.filter(Boolean)
  );

  if (allElos.length === 0) {
    return { min: 0, max: 2000 };
  }

  const y_min = Math.round((Math.min(...allElos) - 50) / 100) * 100;
  const y_max = Math.round((Math.max(...allElos) + 50) / 100) * 100;

  return { min: y_min, max: y_max };
};

// Function to create chart configuration
const createChartConfig = (weeks, elos) => {
  const datasets = createDatasets(elos);
  const { min, max } = calculateYAxisRange(elos);

  return {
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
        zoom: {
          limits: {
            y: { min: min, max: max },
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            wheel: "ctrl",
            mode: "xy",
          },
        },
      },
      scales: {
        y: {
          grid: { display: false },
          beginAtZero: true,
          min: min,
          max: max,
          ticks: {
            callback: function (value) {
              return Math.round(value); // returns the value without formatting
            },
          },
        },
      },
      elements: {
        line: {
          borderWidth: 1.5,
          tension: 0.4, // Smoother curves; set to 0 for straight lines
        },
        point: {
          radius: 2.5
        }
      },
      transitions: {
        zoom: {
          animation: {
            duration: 0,
          },
        },
      },
    },
  };
};

export {
  getRandomColor,
  createDatasets,
  calculateYAxisRange,
  createChartConfig,
};
