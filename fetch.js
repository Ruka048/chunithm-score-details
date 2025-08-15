// ======= PHẦN TÍNH ĐIỂM =======
// Lấy dữ liệu từ DOM
const score = parseInt(
  document.querySelector(".play_musicdata_score_text").textContent.replaceAll(",", ""),
  10
);
const crit = parseFloat(document.querySelector(".text_critical").textContent.replaceAll(",", ""));
const just = parseFloat(document.querySelector(".text_justice").textContent.replaceAll(",", ""));
const atk = parseFloat(document.querySelector(".text_attack").textContent.replaceAll(",", ""));
const miss = parseFloat(document.querySelector(".text_miss").textContent.replaceAll(",", ""));

const maxCombo = crit + just + atk + miss;

// Tính điểm mất
const amountJust = ((just * 0.01) / maxCombo) * 1000000;
const amountAtk = ((atk * 0.51) / maxCombo) * 1000000;
const amountMiss = 1010000 - score - Math.round(amountAtk) - Math.round(amountJust);

// Cập nhật UI văn bản
document.querySelector(".text_justice").textContent =
  just + " (-" + Math.round(amountJust) + ")";
document.querySelector(".text_attack").textContent =
  atk + " (-" + Math.round(amountAtk) + ")";
document.querySelector(".text_miss").textContent =
  miss + " (-" + Math.round(amountMiss) + ")";

// ======= PHẦN CHÈN BIỂU ĐỒ =======
// Tạo thẻ chứa biểu đồ
const chartContainer = document.createElement("div");
chartContainer.style.width = "300px";
chartContainer.style.marginTop = "20px";
chartContainer.innerHTML = `<canvas id="lossChart"></canvas>`;

// Tìm vị trí div play_data_detail_block và chèn phía sau
const detailBlock = document.querySelector(".play_data_detail_block");
if (detailBlock && detailBlock.parentNode) {
  detailBlock.parentNode.insertBefore(chartContainer, detailBlock.nextSibling);
}

// Nạp Chart.js từ CDN và vẽ biểu đồ khi sẵn sàng
const chartScript = document.createElement("script");
chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
chartScript.onload = function () {
  const ctx = document.getElementById("lossChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Justice', 'Attack', 'Miss'],
      datasets: [{
        label: 'Điểm bị mất',
        data: [
          Math.round(amountJust),
          Math.round(amountAtk),
          Math.round(amountMiss)
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.raw + ' điểm';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Điểm mất' }
        }
      }
    }
  });
};
document.body.appendChild(chartScript);
