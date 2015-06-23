# snapcap
Save copies of snapchat stories from response captures of /loq/all_updates and /bq/stories

## Instructions for use

1. Run `npm install` in the repository's folder
2. Place a JSON dump of Snapchat's response from /loq/all_updates or /bq/stories in the folder, named `cap.json`. Make sure to remove any HTTP headers from the file.
3. run `node story-decrypt.js`

## Features

* Automatically discards ads
* Doesn't overwrite previously-downloaded stories
* Does all the decryption for you

## Drawbacks

* Can't automatically login for you
  * Snapchat made their API quite intruder-proof after the Snappening.
  * There's an unused function in the main file that's my failed attempt at login code. Feel free to try to improve it and submit a pull request.
    * With login functionality, the code could run automatically as a cron job!
* Can't make your coffee
