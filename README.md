# snapcap
Save copies of snapchat stories from response captures of /loq/all_updates and /bq/stories

## Instructions for use

1. Run `npm install` in the repository's folder
2. Place a JSON dump of Snapchat's response from /loq/all_updates or /bq/stories in the folder, named `cap.json`. Make sure to remove any HTTP headers from the file.
3. run `node story-decrypt.js`
