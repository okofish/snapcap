
from libmproxy import filt
from libmproxy.protocol.http import decoded
import sys
import subprocess


def start(context, argv):
    context.filter = filt.parse("~s & ~u .*(\/loq\/all_updates|\/bq\/stories).*")


def response(context, flow):
    with decoded(flow.response):  # automatically decode gzipped responses.
        if flow.match(context.filter):
            print("=======================")
            print("Found a valid response!")
            print("=======================")
            with open("cap.json", "w") as myfile:
                myfile.write(flow.response.content)
            subprocess.call(["node", "story-decrypt.js"])
            sys.exit(0)