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

function calcRatingX100(score, chartConst) {
  const c = Math.round(chartConst * 100);
  let off;

  if (score >= 1009000) off = 215;
  else if (score >= 1007500) off = 200 + Math.floor((score - 1007500) / 100);
  else if (score >= 1005000) off = 150 + Math.floor((score - 1005000) / 50);
  else if (score >= 1000000) off = 100 + Math.floor((score - 1000000) / 100);
  else if (score >= 990000) off = 60 + Math.floor((score - 990000) / 250);
  else if (score >= 975000) off = Math.floor((score - 975000) / 250);
  else {
    const anchors = [
      [975000, 0],
      [950000, -150],
      [925000, -300],
      [900000, -500],
    ];
    if (score < anchors[anchors.length - 1][0]) return null;
    for (let i = 0; i < anchors.length - 1; i++) {
      const [s1, o1] = anchors[i];
      const [s2, o2] = anchors[i + 1];
      if (score <= s1 && score >= s2) {
        off = Math.floor(o2 + ((score - s2) * (o1 - o2)) / (s1 - s2));
        break;
      }
    }
  }
  return Math.max(0, c + off);
}

waitForElement(".play_data_detail_block", async function (detailBlock) {
  const readInt = (sel) =>
    parseInt(document.querySelector(sel)?.textContent.replaceAll(",", ""), 10);

  const score = readInt(".play_musicdata_score_text");
  const crit = readInt(".text_critical");
  const just = readInt(".text_justice");
  const atk = readInt(".text_attack");
  const miss = readInt(".text_miss");

  if ([score, crit, just, atk, miss].some(Number.isNaN)) {
    console.error("Không đọc được dữ liệu điểm/judgement.");
    return;
  }

  const totalNotes = crit + just + atk + miss;
  if (totalNotes === 0) return;

  const unit = 1000000 / totalNotes;
  const amountJust = just * 0.01 * unit;
  const amountAtk = atk * 0.51 * unit;
  const amountMiss = miss * 1.01 * unit;

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

  const songTitle = document.querySelector(".play_musicdata_title")?.textContent.trim();
  let difficulty = null;
  if (document.querySelector(".play_track_result img[src*='musiclevel_expert.png']")) {
    difficulty = "exp";
  } else if (document.querySelector(".play_track_result img[src*='musiclevel_master.png']")) {
    difficulty = "mas";
  } else if (document.querySelector(".play_track_result img[src*='musiclevel_ultimate.png']")) {
    difficulty = "ult";
  }

  let chartConst = null;
  if (songTitle && difficulty) {
    try {
      const res = await fetch("https://otoge-db.net/chunithm/data/music-ex.json");
      const data = await res.json();
      const songData = data.find((s) => s.title.trim() === songTitle);
      if (songData) {
        const v = parseFloat(songData[`lev_${difficulty}_i`]);
        if (!Number.isNaN(v) && v > 0) chartConst = v;
      }
    } catch (err) {
      console.error("Failed to fetch chart constant:", err);
    }
  }

  const ratingX100 = chartConst ? calcRatingX100(score, chartConst) : null;

  const chartWrapper = document.createElement("div");
  chartWrapper.style.cssText =
    "display:flex; flex-direction:column; align-items:center; margin-top:20px;";

  const chartContainer = document.createElement("div");
  chartContainer.style.width = "300px";
  chartContainer.innerHTML = `<canvas id="lossChart" style="cursor:pointer;"></canvas>`;
  chartWrapper.appendChild(chartContainer);

  if (ratingX100 !== null) {
    const ratingText = document.createElement("div");
    ratingText.textContent = `Play Rating: ${(ratingX100 / 100).toFixed(2)} (Chart Const: ${chartConst})`;
    ratingText.style.cssText =
      'font-family:"ヒラギノ角ゴ Pro W3", sans-serif; font-size:16px; margin-top:8px; font-weight:bold;';
    chartWrapper.appendChild(ratingText);
  }

  detailBlock.parentNode.insertBefore(chartWrapper, detailBlock.nextSibling);

  const chartScript = document.createElement("script");
  chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
  chartScript.onload = function () {
    const canvas = document.getElementById("lossChart");

    const chartData = {
      labels: ["Justice", "Attack", "Miss"],
      datasets: [
        {
          label: "Score Lost",
          data: [Math.round(amountJust), Math.round(amountAtk), Math.round(amountMiss)],
          backgroundColor: ["#ff9800", "#4caf50", "#9e9e9e"],
        },
      ],
    };

    let chartType = "bar";
    let lossChart = null;

    function render() {
      if (lossChart) lossChart.destroy();
      lossChart = new Chart(canvas.getContext("2d"), {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: chartType === "pie" },
            tooltip: { callbacks: { label: (c) => c.raw + " points" } },
          },
          scales:
            chartType === "bar"
              ? { y: { beginAtZero: true, title: { display: true, text: "Points Lost" } } }
              : {},
        },
      });
    }

    render();
    canvas.addEventListener("click", () => {
      chartType = chartType === "bar" ? "pie" : "bar";
      render();
    });
  };
  document.body.appendChild(chartScript);
});
