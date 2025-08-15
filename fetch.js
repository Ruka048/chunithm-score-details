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

waitForElement(".play_data_detail_block", async function(detailBlock) {
  console.log("Found .play_data_detail_block, starting calculations...");

  // ===== GET DATA FROM PAGE =====
  const score = parseInt(
    document.querySelector(".play_musicdata_score_text").textContent.replaceAll(",", ""),
    10
  );
  const crit = parseFloat(document.querySelector(".text_critical").textContent.replaceAll(",", ""));
  const just = parseFloat(document.querySelector(".text_justice").textContent.replaceAll(",", ""));
  const atk = parseFloat(document.querySelector(".text_attack").textContent.replaceAll(",", ""));
  const miss = parseFloat(document.querySelector(".text_miss").textContent.replaceAll(",", ""));

  const maxCombo = crit + just + atk + miss;

  // ===== CALCULATE SCORE LOSS =====
  const amountJust = ((just * 0.01) / maxCombo) * 1000000;
  const amountAtk = ((atk * 0.51) / maxCombo) * 1000000;
  const amountMiss = 1010000 - score - Math.round(amountAtk) - Math.round(amountJust);

  // ===== UPDATE TEXT IN UI (small loss text) =====
  function updateJudgeText(selector, value, loss) {
    const el = document.querySelector(selector);
    if (el) {
      el.innerHTML = `
        <span style="font-size:14px;">${value}</span>
        <span style="font-size:13px; color:#888; display:inline-block;">(-${Math.round(loss)})</span>
      `;
      el.style.whiteSpace = "nowrap";
    }
  }
  updateJudgeText(".text_justice", just, amountJust);
  updateJudgeText(".text_attack", atk, amountAtk);
  updateJudgeText(".text_miss", miss, amountMiss);

  // ===== GET SONG TITLE & DIFFICULTY =====
  const songTitle = document.querySelector(".play_musicdata_title")?.textContent.trim();
  let difficulty = null;
  if (document.querySelector(".play_track_result img[src*='musiclevel_expert.png']")) {
    difficulty = "exp";
  } else if (document.querySelector(".play_track_result img[src*='musiclevel_master.png']")) {
    difficulty = "mas";
  } else if (document.querySelector(".play_track_result img[src*='musiclevel_ultimate.png']")) {
    difficulty = "ult";
  }

  // ===== FETCH CHART CONSTANT =====
  let chartConst = null;
  if (songTitle && difficulty) {
    try {
      const res = await fetch("https://otoge-db.net/chunithm/data/music-ex.json");
      const data = await res.json();
      const songData = data.find(s => s.title.trim() === songTitle);
      if (songData) {
        const diffKey = `lev_${difficulty}_i`;
        if (songData[diffKey]) chartConst = parseFloat(songData[diffKey]);
      }
    } catch (err) {
      console.error("Failed to fetch chart constant:", err);
    }
  }

  // ===== CALCULATE PLAY RATING (matches table) =====
  let playRating = null;
  if (chartConst) {
    let rate = 0;
    if (score >= 975000 && score <= 989999) { // S.
      rate = chartConst + ((score - 975000) / 2500) * 0.1;
    } else if (score >= 990000 && score <= 999999) { // S+
      rate = chartConst + ((score - 990000) / 2500) * 0.1 + 0.6;
    } else if (score >= 1000000 && score <= 1004999) { // SS
      rate = chartConst + ((score - 1000000) / 1000) * 0.1 + 1.0;
    } else if (score >= 1005000 && score <= 1007499) { // SS+
      rate = chartConst + ((score - 1005000) / 500) * 0.1 + 1.5;
    } else if (score >= 1007500 && score <= 1008999) { // SSS
      rate = chartConst + ((score - 1007500) / 100) * 0.01 + 2.0;
    } else if (score >= 1009000) { // SSS+
      rate = chartConst + 2.4; // max
    }
    playRating = rate;
  }

  // ===== CREATE CHART CONTAINER =====
  const chartWrapper = document.createElement("div");
  chartWrapper.style.display = "flex";
  chartWrapper.style.flexDirection = "column";
  chartWrapper.style.alignItems = "center";
  chartWrapper.style.marginTop = "20px";

  const chartContainer = document.createElement("div");
  chartContainer.style.width = "300px";
  chartContainer.innerHTML = `<canvas id="lossChart" style="cursor:pointer;"></canvas>`;

  chartWrapper.appendChild(chartContainer);

  // Play Rating text (truncate, not round)
  if (playRating !== null) {
    const ratingText = document.createElement("div");
    const truncatedRating = Math.floor(playRating * 100) / 100; // truncate instead of round
    ratingText.textContent = `Play Rating: ${truncatedRating.toFixed(2)} (Chart Const: ${chartConst})`;
    ratingText.style.fontFamily = '"ヒラギノ角ゴ Pro W3", sans-serif';
    ratingText.style.fontSize = "16px";
    ratingText.style.marginTop = "8px";
    ratingText.style.fontWeight = "bold";
    chartWrapper.appendChild(ratingText);
  }

  detailBlock.parentNode.insertBefore(chartWrapper, detailBlock.nextSibling);

  // ===== LOAD CHART.JS AND DRAW =====
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
          tooltip: { callbacks: { label: ctx => ctx.raw + ' points' } }
        },
        scales: chartType === 'bar' ? {
          y: { beginAtZero: true, title: { display: true, text: 'Points Lost' } }
        } : {}
      }
    });

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
            tooltip: { callbacks: { label: ctx => ctx.raw + ' points' } }
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
