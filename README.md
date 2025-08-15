
# Chunithm Score Details

A userscript/bookmarklet that adds score breakdown, loss chart, and play rating calculation to the CHUNITHM NET play result page.

✨ Features

Shows point loss from Justice, Attack, and Miss directly in the result screen.

Adds an interactive bar/pie chart of score loss (click to toggle).

Calculates and displays Play Rating using official chart constants from otoge-db.net.

Clean, centered layout with optimized font sizes for better readability.

📌 **Installation as Bookmarklet**

1. **Create a new bookmark** in your browser.
2. **Copy the following code** and paste it into the URL or Location field of the bookmark:

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://ruka048.github.io/chunithm-score-details/fetch.js';document.body.appendChild(s);}());
```
🚀 Usage

Open any CHUNITHM NET play result page.

Click your saved "Chunithm Score Details" bookmark.

The script will:

Show reduced font size loss values next to each judge count.

Add an interactive chart of points lost.

Display your calculated Play Rating under the chart.

