# snapcap
Save copies of snapchat stories from response captures of /loq/all_updates and /bq/stories

## Instructions for use

1. Run `npm install` in the repository's folder
2. Place a JSON dump of Snapchat's response from /loq/all_updates or /bq/stories in the folder, named `cap.json`. Make sure to remove any HTTP headers from the file.
3. Run `node story-decrypt.js`

### *Or if you're feeling adventurous...*

You can now automatically capture responses using a mitmproxy script, as long as you have mitmproxy and your iOS device configured correctly:

1. Set your iOS device to manual proxy, pointing towards your computer at mitmproxy's port (default 8080)
2. Run `sh mitm.sh` in the repository's folder
3. Putter around in Snapchat, dragging lists down to refresh, until the script says that it's done.
4. There is no step 4.

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
