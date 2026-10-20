# Chunithm Score Details

A bookmarklet that adds a score breakdown, an interactive loss chart, and a Play Rating calculation to the **CHUNITHM NET** play result page.

## Features

- **Score loss per judgement**: shows how many points you lost to Justice, Attack, and Miss, right next to each judgement count.
- **Loss chart**: an interactive bar chart of points lost. Click it to switch to a pie chart, and click again to switch back.
- **Play Rating**: calculates the rating of the play using chart constants from [otoge-db.net](https://otoge-db.net/chunithm/).
- **Clean layout**: a centered chart and compact loss text that don't clutter the result screen.

## Installation

1. Create a new bookmark in your browser.
2. Name it `Chunithm Score Details`.
3. Paste the following code into the **URL** (or **Location**) field of the bookmark:

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://ruka048.github.io/chunithm-score-details/fetch.js';document.body.appendChild(s);}());
```

## Usage

1. Log in to CHUNITHM NET and open any play result page.
2. Click the `Chunithm Score Details` bookmark.
3. The script will:
   - Show the points lost next to the Justice, Attack, and Miss counts.
   - Add an interactive chart of points lost below the result details.
   - Display your calculated Play Rating under the chart, along with the chart constant used.

## Notes

- An internet connection is required, because chart constants are fetched from otoge-db.net.
- The Play Rating is shown only for Expert, Master, and Ultima charts that can be found in the database. If a song is not found, the loss values and chart are still displayed.
- WORLD'S END charts have no chart constant, so no Play Rating is shown for them.
- Songs are matched by title, so songs that share the same title may occasionally show the wrong chart constant.

## Disclaimer

This is an unofficial fan-made tool. It is not affiliated with or endorsed by SEGA. Use it at your own risk.
