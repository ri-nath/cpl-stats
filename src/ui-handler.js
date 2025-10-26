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

    // Fade out other lines
    chartInstance.data.datasets.forEach((dataset, index) => {
      dataset.borderWidth = index === clickedDatasetIndex ? 3 : 0.5; // Thicker line for the selected dataset
    });
  } else {
    deselectLine(chartInstance);
    chartInstance.update();
  }

  chartInstance.update(); // Redraw the chart
};

// Function to deselect line
const deselectLine = (chartInstance) => {
  chartInstance.data.datasets.forEach((dataset) => {
    dataset.borderWidth = undefined; // Reset border width
  });
};

// Function to create chart element
const createChartElement = (ctx, config) => {
  if (chart) {
    chart.data = config.data;
    chart.options = config.options;
    chart.update("resize");
    deselectLine(chart);
  } else {
    chart = new Chart(ctx, config);
  }

  // Add event listeners for click and mouseout
  ctx.canvas.addEventListener("click", (event) => {
    handleChartClick(event, chart);
  });

  return chart;
};

export { createChartElement, handleChartClick, deselectLine };
