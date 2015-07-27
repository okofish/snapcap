# we're invalidating the checksum so the server is forced to send a new copy of the file
mitmdump --replace ":~q:checksum=.:checksum=a" -s "mitmproxy.py"