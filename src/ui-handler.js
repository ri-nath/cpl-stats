// UI Handler Module
let chart = null;
let currentlySelected = undefined;

// Function to handle chart click events
const handleChartClick = (event, chartInstance) => {
  const activePoints = chartInstance.getElementsAtEventForMode(
    event,
    "nearest",
    { intersect: true },
    false
  );

  if (activePoints.length) {
    const clickedDatasetIndex = activePoints[0].datasetIndex; // Identify clicked dataset

    // Deselect if double-clicking...
    if (clickedDatasetIndex === currentlySelected) {
      deselectLine(chartInstance);
    } else {
      currentlySelected = clickedDatasetIndex;
      // Fade out other lines
      chartInstance.data.datasets.forEach((dataset, index) => {
        dataset.borderWidth = index === clickedDatasetIndex ? 3 : 0.5; // Thicker line for the selected dataset
      });
    }
    chartInstance.update(); // Redraw the chart
  } else {
    // ... or if just clicking anywhere on the canvas.
    if (currentlySelected) {
      deselectLine(chartInstance);
      chartInstance.update();
    }
  }
};

// Function to deselect line
const deselectLine = (chartInstance) => {
  currentlySelected = undefined;
  chartInstance.data.datasets.forEach((dataset) => {
    dataset.borderWidth = undefined; // Reset border width
  });
};

// Function to create chart element
const createChartElement = (ctx, config) => {
  console.log(config);
  if (chart) {
    chart.data = config.data;
    chart.options = config.options;
    chart.update("resize");
  } else {
    chart = new Chart(ctx, config);
  }

  // Add event listeners for click and mouseout
  ctx.canvas.addEventListener("click", (event) =>
    handleChartClick(event, chart)
  );

  return chart;
};

export { createChartElement, handleChartClick, deselectLine };
