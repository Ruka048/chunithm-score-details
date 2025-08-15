// Helper: wait for an element to appear in the DOM
function waitForElement(selector, callback) {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
  } else {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        callback(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

waitForElement(".play_data_detail_block", function(detailBlock) {
  console.log("Found .play_data_detail_block, starting calculations...");

  // ======= GET DATA FROM PAGE =======
  const score = parseInt(
    document.querySelector(".play_musicdata_score_text").textContent.replaceAll(",", ""),
    10
  );
  const crit = parseFloat(document.querySelector(".text_critical").textContent.replaceAll(",", ""));
  const just = parseFloat(document.querySelector(".text_justice").textContent.replaceAll(",", ""));
  const atk = parseFloat(document.querySelector(".text_attack").textContent.replaceAll(",", ""));
  const miss = parseFloat(document.querySelector(".text_miss").textContent.replaceAll(",", ""));

  const maxCombo = crit + just + atk + miss;

  // ======= CALCULATE SCORE LOSS =======
  const amountJust = ((just * 0.01) / maxCombo) * 1000000;
  const amountAtk = ((atk * 0.51) / maxCombo) * 1000000;
  const amountMiss = 1010000 - score - Math.round(amountAtk) - Math.round(amountJust);

  // ======= UPDATE TEXT IN UI (smaller loss text) =======
  function updateJudgeText(selector, value, loss) {
    const el = document.querySelector(selector);
    if (el) {
      el.innerHTML = `${value} <span style="font-size:0.8em; color:#888;">(-${Math.round(loss)})</span>`;
      el.style.whiteSpace = "nowrap"; // prevent wrapping
    }
  }

  updateJudgeText(".text_justice", just, amountJust);
  updateJudgeText(".text_attack", atk, amountAtk);
  updateJudgeText(".text_miss", miss, amountMiss);

  // ======= CREATE CHART CONTAINER (CENTERED) =======
  const chartWrapper = document.createElement("div");
  chartWrapper.style.display = "flex";
  chartWrapper.style.justifyContent = "center";
  chartWrapper.style.marginTop = "20px";

  const chartContainer = document.createElement("div");
  chartContainer.style.width = "300px";
  chartContainer.innerHTML = `<canvas id="lossChart" style="cursor:pointer;"></canvas>`;

  chartWrapper.appendChild(chartContainer);
  detailBlock.parentNode.insertBefore(chartWrapper, detailBlock.nextSibling);

  // ======= LOAD CHART.JS AND DRAW =======
  const chartScript = document.createElement("script");
  chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  chartScript.onload = function() {
    const ctx = document.getElementById("lossChart").getContext("2d");

    const chartData = {
      labels: ['Justice', 'Attack', 'Miss'],
      datasets: [{
        label: 'Score Lost',
        data: [
          Math.round(amountJust),
          Math.round(amountAtk),
          Math.round(amountMiss)
        ],
        backgroundColor: ['#ff9800', '#4caf50', '#9e9e9e']
      }]
    };

    let chartType = 'bar';
    let lossChart = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { display: chartType === 'pie' },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.raw + ' points';
              }
            }
          }
        },
        scales: chartType === 'bar' ? {
          y: { beginAtZero: true, title: { display: true, text: 'Points Lost' } }
        } : {}
      }
    });

    // Toggle between bar and pie chart on click
    document.getElementById("lossChart").addEventListener("click", function() {
      chartType = (chartType === 'bar') ? 'pie' : 'bar';
      lossChart.destroy();
      lossChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: chartType === 'pie' },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.raw + ' points';
                }
              }
            }
          },
          scales: chartType === 'bar' ? {
            y: { beginAtZero: true, title: { display: true, text: 'Points Lost' } }
          } : {}
        }
      });
    });
  };
  document.body.appendChild(chartScript);
});
