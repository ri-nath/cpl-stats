// Main Application Module
// Function to fetch and parse JSON data
const fetchData = (url) => {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to load data");
    return response.json();
  });
};

// Function to initialize ELO tracking and create the chart
const initializeELOChart = (seasons, includePlayoffs = true) => {
  let x_axis = [""];
  let elos = {};

  for (const [seasonIndex, season] of seasons.entries()) {
    let weeks = [];
    season.weeks.forEach((weekGames, weekIndex) => {
      let x_axis_index = x_axis.length + weekIndex;
      weeks.push(`s${seasonIndex + 1}w${weekIndex + 1}`);
      elos = DataProcessor.processGames(weekGames, elos, x_axis_index);
    });

    if (includePlayoffs) {
      season.playoffs.forEach((playoffGames, playoffIndex) => {
        let x_axis_index = x_axis.length + season.weeks.length + playoffIndex;
        weeks.push(`s${seasonIndex + 1}p${playoffIndex + 1}`);
        elos = DataProcessor.processGames(playoffGames, elos, x_axis_index);
      });
    }

    x_axis = x_axis.concat(weeks);
  }

  console.log("x_axis", x_axis, "elos", elos);

  return { weeks: x_axis, elos: elos };
};

// Main function to run the application
const main = () => {
  const urls = ["./data/s1.json", "./data/s2.json", "./data/s3.json"]; // List of JSON files

  // Fetch all data files
  Promise.all(urls.map(fetchData))
    .then((data) => {
      const { weeks, elos } = initializeELOChart(data);
      const config = Charting.createChartConfig(weeks, elos);
      const ctx = document.getElementById("eloChart").getContext("2d");
      UIHandler.createChartElement(ctx, config);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// Function to handle playoff toggle
const handlePlayoffToggle = (includePlayoffs) => {
  const urls = ["./data/s1.json", "./data/s2.json", "./data/s3.json"];

  Promise.all(urls.map(fetchData))
    .then((data) => {
      const { weeks, elos } = initializeELOChart(data, includePlayoffs);
      const config = Charting.createChartConfig(weeks, elos);
      const ctx = document.getElementById("eloChart").getContext("2d");
      UIHandler.createChartElement(ctx, config);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export { main, handlePlayoffToggle };
