// Main Application Module
// Function to fetch and parse JSON data
const fetchData = (url) => {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to load data");
    return response.json();
  });
};

// Function to initialize ELO tracking and create the chart
const initializeELOChart = (seasons, includePlayoffs, dataRange) => {
  let x_axis = [""];
  let elos = {};

  for (const [seasonIndex, season] of seasons.entries()) {
    let weeks = [];
    season.weeks.forEach((weekGames, weekIndex) => {
      let x_axis_index = x_axis.length + weekIndex;
      let fauxDate = `s${seasonIndex + 1}w${weekIndex + 1}`;
      if (doesDateLieInRange(fauxDate, dataRange)) {
        weeks.push(fauxDate);
        elos = DataProcessor.processGames(weekGames, elos, x_axis_index);
      }
    });

    if (includePlayoffs) {
      season.playoffs.forEach((playoffGames, playoffIndex) => {
        let x_axis_index = x_axis.length + season.weeks.length + playoffIndex;
        let fauxDate = `s${seasonIndex + 1}p${playoffIndex + 1}`;
        if (doesDateLieInRange(fauxDate, dataRange)) {
          weeks.push(fauxDate);
          elos = DataProcessor.processGames(
            playoffGames,
            elos,
            x_axis_index,
            season.metadata
          );
        }
      });
    }

    x_axis = x_axis.concat(weeks);
  }

  return { weeks: x_axis, elos: elos };
};

let data = {};

let INCLUDE_PLAYOFFS = true;
let DATA_RANGE = null;

// Main function to run the application
const main = () => {
  const urls = [
    "./data/s1.json",
    "./data/s2.json",
    "./data/s3.json",
    "./data/s4.json",
    "./data/s5.json",
    "./data/s6.json",
  ];

  // Fetch all data files
  Promise.all(urls.map(fetchData))
    .then((fetchedData) => {
      data = fetchedData;
      const { weeks, elos } = initializeELOChart(
        data,
        INCLUDE_PLAYOFFS,
        DATA_RANGE
      );
      const config = Charting.createChartConfig(weeks, elos);
      const ctx = document.getElementById("eloChart").getContext("2d");
      UIHandler.createChartElement(ctx, config);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// Redraw
const refresh = () => {
  const { weeks, elos } = initializeELOChart(
    data,
    INCLUDE_PLAYOFFS,
    DATA_RANGE
  );
  const config = Charting.createChartConfig(weeks, elos);
  const ctx = document.getElementById("eloChart").getContext("2d");
  UIHandler.createChartElement(ctx, config);
};

const parseDataRange = (dataRangeStr) => {
  let i = 0;
  let bounds = [];
  while (i < dataRangeStr.length) {
    if (i + 10 > dataRangeStr.length) {
      return "incomplete range";
    }
    let dots = dataRangeStr.slice(i + 4, i + 6);
    if (dots != "..") {
      return `expected '..' at ${(i + 4, i + 5)}, got: ${dots}`;
    }
    let startBound = parseFauxDate(dataRangeStr.slice(i, i + 4));
    let endBound = parseFauxDate(dataRangeStr.slice(i + 6, i + 10));
    if (typeof startBound === "string") {
      return startBound;
    }
    if (typeof endBound === "string") {
      return endBound;
    }
    bounds.push({ start: startBound, end: endBound });
    if (i + 10 >= dataRangeStr.length) {
      return bounds;
    }
    if (dataRangeStr[i + 10] != ",") {
      return `expected ',' at ${i + 11}, got: ${dataRangeStr[i + 10]}`;
    }
    i += 11;
  }
  return bounds;
};

const parseFauxDate = (boundStr) => {
  if (boundStr.length != 4) {
    return `expected bound to be length 4, got length: ${boundStr.length}`;
  }
  if (boundStr[0] != "s") {
    return `expected bound to begin with 's', found: ${boundStr[0]}`;
  }
  let season = parseInt(boundStr[1]);
  if (isNaN(season)) {
    return `season is not a number: ${boundStr[1]}`;
  }
  let type = boundStr[2];
  if (type != "w" && type != "p") {
    return `expected bound to have 'w' or 'p', found: ${type}`;
  }
  let number = parseInt(boundStr[3]);
  if (isNaN(number)) {
    return `week/playoff number is not a number: ${boundStr[3]}`;
  }
  return {
    season,
    type,
    number,
  };
};

const doesDateLieInRange = (date, ranges) => {
  if (!ranges) {
    return true;
  }
  let fauxDate = parseFauxDate(date);
  for (const range of ranges) {
    if (
      doesFirstComeBeforeSecond(range.start, fauxDate) &&
      doesFirstComeBeforeSecond(fauxDate, range.end)
    ) {
      return true;
    }
  }
  return false;
};

const doesFirstComeBeforeSecond = (first, second) => {
  return (
    first.season < second.season ||
    (first.season == second.season &&
      ((first.type == second.type && first.number <= second.number) ||
        (first.type == "w" && second.type == "p")))
  );
};

// Update ELO configuration
const updateDataConfig = (config) => {
  INCLUDE_PLAYOFFS =
    config.includePlayoffs != undefined
      ? config.includePlayoffs
      : INCLUDE_PLAYOFFS;
  if (config.dataRange) {
    let parsedDataRange = parseDataRange(config.dataRange);
    if (typeof parsedDataRange == "string") {
      return parsedDataRange;
    }
    DATA_RANGE = parsedDataRange;
  }
  return true;
};

export { main, updateDataConfig, refresh };
