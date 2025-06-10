var score = parseInt(
  document
    .getElementsByClassName("play_musicdata_score_text")
    .item(0)
    .innerHTML.replaceAll(",", "")
);
console.log("score: " + score);
var crit = parseFloat(
  document
    .getElementsByClassName("text_critical")
    .item(0)
    .innerHTML.replace(",", "")
);
console.log("critical justice: " + crit);
var just = parseFloat(
  document
    .getElementsByClassName("text_justice")
    .item(0)
    .innerHTML.replace(",", "")
);
console.log("justice: " + just);
var atk = parseFloat(
  document
    .getElementsByClassName("text_attack")
    .item(0)
    .innerHTML.replace(",", "")
);
console.log("attack: " + atk);
var miss = parseFloat(
  document
    .getElementsByClassName("text_miss")
    .item(0)
    .innerHTML.replace(",", "")
);
console.log("miss: " + miss);

var maxCombo = crit + just + atk + miss;
var judgeBlock = document
  .getElementsByClassName("play_data_detail_judge_block")
  .item(0);
judgeBlock.style.paddingLeft = "115px";
var judgeText = document.getElementsByClassName("play_data_detail_judge_text");
for (var i = 1; i < 4; i++) {
  judgeText.item(i).style.width = "120px";
  judgeText.item(i).style.textAlign = "left";
  judgeText.item(i).style.fontSize = "0.8rem";
}
var amountJust = ((just * 0.01) / maxCombo) * 1000000;
console.log(amountJust);
document.getElementsByClassName("text_justice").item(0).innerHTML =
  just + " (-" + Math.round(amountJust) + ")";
var amountAtk = ((atk * 0.505) / maxCombo) * 1000000; //cal atk amount
console.log(amountAtk);
document.getElementsByClassName("text_attack").item(0).innerHTML =
  atk + " (-" + Math.round(amountAtk) + ")";
var amountMiss =
  1010000 - score - Math.round(amountAtk) - Math.round(amountJust);
console.log(amountMiss);
document.getElementsByClassName("text_miss").item(0).innerHTML =
  miss + " (-" + Math.round(amountMiss) + ")";
