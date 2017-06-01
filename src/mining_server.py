#!/usr/bin/env python3
import sys
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import hashlib
import socket
import time

class StateRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
    	# parse paramters
        parameters = self.parse()

        # parameter validation
        if parameters == None or len(parameters) == 0:
            self.bad_request()
            return
        if 'target' not in parameters:
            self.bad_request()
            return

        # calculate
        nonce, duration = self.calculate(parameters['target'][0])
        result = json.dumps([nonce, duration])
        print(result)

        # write response
        self.send_response(200)
        self.send_header('content-type', 'application/json')
        self.end_headers()
        self.wfile.write(bytes(result, 'utf-8'))

    def calculate(self, target):
        sha256 = hashlib.sha256()
        target = int(target, 16)
        nonce = 1
        start = int(round(time.time()) * 1000)
        while True:
            sha256.update(b'%d\r\n' % nonce)
            hash = sha256.hexdigest()
            hash = int(hash, 16)
            if hash <= target:
                duration = int((int(round(time.time()) * 1000) - start) / 1000 / 60)
                return nonce, duration
            nonce += 1

    def parse(self):
        path = urlparse(self.path)
        parameters = parse_qs(path.query)
        return parameters

    def bad_request(self):
        self.send_error(400, 'lack of parameters longitude and latitude')
        self.end_headers()

if __name__ == "__main__":
    host = '' # localhost
    port = 8080

    http_server = HTTPServer((host, port), StateRequestHandler)
    try:
        http_server.serve_forever()
    except KeyboardInterrupt:
        pass

    http_server.server_close()
