// Import modules
import {
  checkForAlias,
  calculateELO,
  processGames,
  interpolateData,
} from "./data-processor.js";
import {
  getRandomColor,
  createDatasets,
  calculateYAxisRange,
  createChartConfig,
} from "./charting.js";
import {
  createChartElement,
  handleChartClick,
  deselectLine,
} from "./ui-handler.js";
import { main, handlePlayoffToggle } from "./app.js";

// Make modules available globally for backward compatibility
window.DataProcessor = {
  checkForAlias,
  calculateELO,
  processGames,
  interpolateData,
};

window.Charting = {
  getRandomColor,
  createDatasets,
  calculateYAxisRange,
  createChartConfig,
};

window.UIHandler = {
  createChartElement,
  handleChartClick,
  deselectLine,
};

window.App = {
  main,
  handlePlayoffToggle,
};

// Add event listener for the playoff toggle
document
  .getElementById("playoffsToggle")
  .addEventListener("change", function () {
    const includePlayoffs = this.checked;
    App.handlePlayoffToggle(includePlayoffs);
  });

// Run the main function
App.main();
