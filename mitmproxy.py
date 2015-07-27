# for the record, I'm only using python because I have to.

from libmproxy import filt
from libmproxy.protocol.http import decoded
import sys
import subprocess


def start(context, argv):
    context.filter = filt.parse("~s & ~u .*(\/loq\/all_updates|\/bq\/stories).*")   # only calls to /loq/all_updates or /bq/stories. edit this if you want to save responses from different endpoints


def response(context, flow):
    with decoded(flow.response):  # automatically decode gzipped responses.
        if flow.match(context.filter):
            print("=======================")
            print("Found a valid response!")
            print("=======================")
            with open("cap.json", "w") as myfile:
                myfile.write(flow.response.content) # save matching response as cap.json
            subprocess.call(["node", "story-decrypt.js"])   # call story-decrypt.js to fetch, decrypt, and save stories
            sys.exit(0)