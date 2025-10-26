// Import modules
import {
  normalizeName,
  calculateELO,
  processGames,
  interpolateData,
  updateELOConfig,
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
import { main, updateDataConfig, refresh } from "./app.js";

// Make modules available globally for backward compatibility
window.DataProcessor = {
  normalizeName,
  calculateELO,
  processGames,
  interpolateData,
  updateELOConfig,
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
  updateDataConfig,
  refresh,
};

const DEFAULT_DATA_CONFIG = {
  includePlayoffs: true,
  dataRange: "s1w1..s6p4",
};

const DEFAULT_ELO_CONFIG = {
  k: 50,
  floorElo: null,
  highElo: 1500,
  kHighElo: 15,
};

document.getElementById("kFactor").addEventListener("input", function () {
  updateELOConfig({ k: parseFloat(this.value) || DEFAULT_ELO_CONFIG.k });
  refresh();
});

document.getElementById("floorElo").addEventListener("input", function () {
  updateELOConfig({ floorElo: parseFloat(this.value) || null });
  refresh();
});

document.getElementById("highElo").addEventListener("input", function () {
  // We allow this to be overriden to NULL.
  updateELOConfig({ highElo: parseFloat(this.value) || null });
  refresh();
});

document
  .getElementById("kFactorHighElo")
  .addEventListener("input", function () {
    updateELOConfig({
      kHighElo: parseFloat(this.value) || DEFAULT_ELO_CONFIG.kHighElo,
    });
    refresh();
  });

// Add event listener for the playoff toggle
document
  .getElementById("playoffsToggle")
  .addEventListener("change", function () {
    updateDataConfig({
      includePlayoffs: this.checked,
    });
    refresh();
  });

document.getElementById("dataRange").addEventListener("change", function () {
  let res = updateDataConfig({
    dataRange: this.value || DEFAULT_DATA_CONFIG.dataRange,
  });
  if (typeof res == "string") {
    alert(res);
  } else {
    refresh();
  }
});

// Add reset functionality for data config
document
  .getElementById("resetDataConfig")
  .addEventListener("click", function () {
    // Reset playoff toggle to checked
    document.getElementById("playoffsToggle").checked =
      DEFAULT_DATA_CONFIG.includePlayoffs;
    document.getElementById("dataRange").value = DEFAULT_DATA_CONFIG.dataRange;

    // Update the configuration and refresh the chart
    updateDataConfig(DEFAULT_DATA_CONFIG);
    refresh();
  });

// Add reset functionality for ELO config
document
  .getElementById("resetEloConfig")
  .addEventListener("click", function () {
    // Reset all ELO input fields to their default values
    document.getElementById("kFactor").value = DEFAULT_ELO_CONFIG.k;
    document.getElementById("floorElo").value = DEFAULT_ELO_CONFIG.floorElo;
    document.getElementById("highElo").value = DEFAULT_ELO_CONFIG.highElo;
    document.getElementById("kFactorHighElo").value =
      DEFAULT_ELO_CONFIG.kHighElo;

    // Update the ELO configuration and refresh the chart
    updateELOConfig(DEFAULT_ELO_CONFIG);
    refresh();
  });

// Reset data & run the main function
updateDataConfig(DEFAULT_DATA_CONFIG);
updateELOConfig(DEFAULT_ELO_CONFIG);
App.main();
