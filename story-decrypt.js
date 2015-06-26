// processes json dumps of responses from (snapchathost)/loq/all_updates and (snapchathost)/bq/stories

var fs = require('fs')
var path = require('path')
var https = require('https');
var querystring = require('querystring')
var request = require('request');
var _ = require('underscore') // underscore ftw!!!! seriously, it should be incorporated into ecmascript
var MCrypt = require('mcrypt').MCrypt; // we're using mcrypt because crypto doesn't fully support rijndael. aes is a subset of rijndael, but it doesn't support all of rijndael's key lengths
var crypto = require('crypto'); // however, we're using crypto for hash generation because mcrypt doesn't have hashes :(              ) my editor screws with indents if i don't close that 
var AdmZip = require('adm-zip'); // for extracting zipped videos

// base64 decoder function

function b64decode(s) {
  var b = new Buffer(s, 'base64');
  return b
}

// create snapchat token
// see http://gibsonsec.org/snapchat/fulldisclosure/#authentication-tokens, although a bit outdated

function create_token(auth_token, timestamp) {
  var timestamp = timestamp || Math.floor(new Date());
  var secret = "iEk21fuwZApXlz93750dmW22pw389dPwOk";
  var pattern = "0001110111101110001111010101111011010001001110011000110001000110".split('');
  var hash1 = crypto.createHash('sha256').update(secret + auth_token).digest('hex').split('');
  var hash2 = crypto.createHash('sha256').update(timestamp.toString() + secret).digest('hex').split('');
  var substituted = _.map(pattern, function(template, index) {
    if (template == "0") {
      return hash1[index]
    } else {
      return hash2[index]
    }
  }).join('');
  return substituted
}

// attempting to fetch dtoken param for future use
// doesn't work

function dtoken() {
  var timestamp = Math.floor(new Date());

  var postData = {
    req_token: create_token('m198sOkJEn37DjqZ32lpRu76xmw288xSQ9', timestamp),
    timestamp: timestamp.toString()
  }
  console.log(postData)
  var options = {
    url: 'https://feelinsonice-hrd.appspot.com/loq/device_id',
    headers: {
      'Accept-Language': 'en-US;q=1, en;q=0.9',
      'Accept-Locale': 'en',
      'Content-Length': postData.length,
      'User-Agent': 'Snapchat/9.10.0.21 (iPad2,5; iOS 9.0; gzip)'
    },
    form: postData
  }

  request.post(options, function(err, httpResponse, body) {
    if (!err && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
    }
  })
  /*
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.error('problem with request: ' + e.message);
  });

  req.write(postData);
  req.end();*/
}
//console.log(dtoken())

// attempting to login
// since snapchat beefed up their api, there are a few odd parameters and headers that i can't figure out
// doesn't work

function login(username, password) {
  var timestamp = Math.floor(new Date());
  var postData = {
    username: username,
    timestamp: (timestamp + 1).toString(),
    req_token: create_token(create_token('m198sOkJEn37DjqZ32lpRu76xmw288xSQ9', timestamp), timestamp),
    password: password,
    is_two_fa: "false",
    dsig: "FF0966D5A68748F00B02", // i have no idea what the parameters from here down to ptoken mean. i just copied them from a request my iPad made.
    dtoken1i: "00001:GAGP4VtiSNOfi6uCctPE2Rk5Qtdo8wJwepLGjIHNkFRLHCoaJG45owMiHuv4UaN5",
    pre_auth_token: "",
    width: "640",
    height: "960",
    ptoken: "<96f6adf2 63320fff 5b8cbc8e 57787f4d 4f814c3a 364c26f4 c4523f5d 7817757f>"
  }
  console.log(postData)
  var options = {
    url: 'https://feelinsonice-hrd.appspot.com/loq/login',
    headers: {
      'X-Snapchat-Client-Token': 'v1:D292427AA30C8B5641B0B2921AE1D82D:3677527BED4973ADA25DED83FCF3045EEE6B294558E56A464BE233BFE9D6350A280978F265982603D43C9B55636E68F5',
      'X-Snapchat-Client-Auth-Token': 'v1:AC7FED0772D23267887EC531DE72D368:227FFD9BF35C411B1B0425422CF10696BDE5F4AA95EA82EB4604C9E42FDFA0FBD7AD78E82DC7E1C8B4EC63B727B71819',
      'X-Timestamp': timestamp.toString(),
      'Accept-Language': 'en',
      'Accept-Locale': 'en',
      'Accept-Encoding': 'utf8',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      'User-Agent': 'Snapchat/9.10.0.21 (iPad2,5; iOS 9.0; gzip)'
    },
    form: postData
  };
  request.post(options, function(err, httpResponse, body) {
    if (!err) {
      console.log(body)
    }
  })
}
//console.log(login())

// save media file locally, given url, filename, and encryption parameters

function saveMediaFile(url, file, key, iv, zipped) {
  request.get({ // send get request to fetch file
    url: url,
    encoding: 'binary'
  }, function(error, response, body) {
    if (error) console.error(error);
    if (response.statusCode != 404) { // if status code is 404, then the media file has expired
      var m = new MCrypt('rijndael-128', 'cbc');
      m.open(b64decode(key), b64decode(iv)); // setting key and iv. note the b64 decode
      var decrypted = m.decrypt(new Buffer(body, 'binary')); // decrypt file
      fs.writeFile(file, decrypted, { // save decrypted file
        flags: 'w',
        encoding: 'binary' // 01100010 01101001 01101110 01100001 01110010 01111001
      }, function(err) {
        if (err) throw err
        console.log(path.basename(file) + " saved")
        if (zipped) {
          
          var zipdir = path.dirname(file) + "/" + path.basename(file,".zip");
          if (!fs.existsSync(zipdir)) { // create zip directory if it doesn't already exist
            fs.mkdirSync(zipdir);
          }
          
          var zip = new AdmZip(file);
          
          zip.extractAllTo(zipdir, /*overwrite*/false);
          
          var extracted = fs.readdirSync(zipdir);
          var mediaextractedQ = false
          var overlayextractedQ = false
          
          extracted.forEach(function(direntry) {
            if (direntry.indexOf('media') != -1) {
              fs.rename(zipdir + "/" + direntry, zipdir + "/" + direntry + ".mp4")
              console.log(path.basename(file) + " media extracted and saved")
              mediaextractedQ = true
            } else if (direntry.indexOf('overlay') != -1) {
              fs.rename(zipdir + "/" + direntry, zipdir + "/" + direntry + ".png")
              console.log(path.basename(file) + " overlay extracted and saved")
              overlayextractedQ = true
            }
          });
          
          if (mediaextractedQ || (mediaextractedQ && overlayextractedQ)) {  // either there is just media or media and an overlay. otherwise, don't delete the zip, in case manual recovery is required. i'm taking this way too seriously
            fs.unlinkSync(file)
            console.log(path.basename(file) + " deleted")
          }
          
        }
          
      })
    }
  })
}

var dir = "./stories";
if (!fs.existsSync(dir)) { // create ./stories if it doesn't already exist
  fs.mkdirSync(dir);
}

var cap = JSON.parse(fs.readFileSync('cap.json')) // import capture file. make sure to remove any headers from the file so it's just json

var storiesToProcess // f***ing variable scope

if (cap.hasOwnProperty('mature_content_text')) { // differentiate between /loq/all_updates and /bq/stories
  storiesToProcess = _.pluck(_.filter(cap.friend_stories, function(story) { // /bq/stories only has the friend_stories object
    return !story.hasOwnProperty('ad_placement_metadata'); // only add story to list if it's not an ad!
  }), 'stories')
} else {
  storiesToProcess = _.pluck(_.filter(cap.stories_response.friend_stories, function(story) { // while /loq/all_updates has stories_response.friend_stories
    return !story.hasOwnProperty('ad_placement_metadata');
  }), 'stories')
}



_.map(storiesToProcess, function(story) { // since there can be multiple media objects in one person's story, we use two nested maps
  var dir = "./stories/" + story[0].story.username;
  if (!fs.existsSync(dir)) { // create directory for the username if it doesn't already exist
    fs.mkdirSync(dir);
  }
  _.map(_.pluck(story, "story"), function(media) {
    var filepath = "./stories/" + media.username + "/" + media.id + ((media.media_type == 0) ? ".jpg" : media.zipped ? ".zip" : ".mp4")
    if (!fs.existsSync(filepath)) { // save media file if it doesn't already exist. this allows you to use capture files with overlapping story objects without risking file loss
      try {
        saveMediaFile(media.media_url, filepath, media.media_key, media.media_iv, media.zipped)
      } catch (e) { // just in case :)
        console.error(e)
      }
    }
  });
});
