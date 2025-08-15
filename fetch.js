// Extract values and parse integers/floats robustly
const score = parseInt(
  document
    .querySelector(".play_musicdata_score_text")
    .textContent
    .replaceAll(",", ""),
  10
);

const jcrit = parseFloat(
  document.querySelector(".text_critical").textContent.replaceAll(",", "")
);
const justice = parseFloat(
  document.querySelector(".text_justice").textContent.replaceAll(",", "")
);
const attack = parseFloat(
  document.querySelector(".text_attack").textContent.replaceAll(",", "")
);
const miss = parseFloat(
  document.querySelector(".text_miss").textContent.replaceAll(",", "")
);

console.log({ score, jcrit, justice, attack, miss });

// Total notes
const totalNotes = jcrit + justice + attack + miss;

// Calculate accuracy percentage
const accuracy = (
  (jcrit * 1.01 +
    justice * 1.00 +
    attack * 0.50 +
    0 * miss) /
  totalNotes
);

// Compute theoretical score (max 1,010,000)
const computedScore = accuracy * 10000;

// Calculate point gaps between actual score and perfect (1,010,000)
const PERFECT_SCORE = 1010000; // Ideally from game metadata
const gap = PERFECT_SCORE - score;

// Distribute gap proportionally to judgment "loss" costs
const lossPerJustice = (1.00 - 1.01) / totalNotes * 10000; // negative
const lossPerAttack = (0.50 - 1.00) / totalNotes * 10000;
const lossPerMiss = (0 - 1.00) / totalNotes * 10000;

const lostJustice = justice * lossPerJustice;
const lostAttack = attack * lossPerAttack;
const lostMiss = miss * lossPerMiss;

// Update UI with clarity
document.querySelector(".text_justice").textContent =
  `${justice} (–${Math.round(Math.abs(lostJustice))})`;
document.querySelector(".text_attack").textContent =
  `${attack} (–${Math.round(Math.abs(lostAttack))})`;
document.querySelector(".text_miss").textContent =
  `${miss} (–${Math.round(Math.abs(lostMiss))})`;

// Optionally log calculations
console.log({ computedScore, gap, lostJustice, lostAttack, lostMiss });
