#!/usr/bin/env python3
"""
Development server for Her Hollywood Story SPA
Handles client-side routing by serving index.html for database routes
"""

import http.server
import socketserver
import os
import sys
import mimetypes
from urllib.parse import urlparse

PORT = 8000
DIRECTORY = "site"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Parse the URL path
        parsed_path = urlparse(self.path).path
        
        # Check if this is a database route that needs SPA handling
        if '/database/' in parsed_path:
            # Check if there's an actual file at this path
            file_path = os.path.join(DIRECTORY, parsed_path.lstrip('/'))
            
            # If it's not a real file (no extension), serve the database index.html
            if not os.path.exists(file_path) and not os.path.splitext(parsed_path)[1]:
                self.path = '/database/index.html'
        
        # Call parent method to actually serve the file
        return super().do_GET()
    
    def guess_type(self, path):
        """Ensure JSON files are served with correct MIME type"""
        mimetype = super().guess_type(path)
        if path.endswith('.json'):
            return 'application/json'
        return mimetype
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == "__main__":
    # Ensure JSON files are served with correct MIME type
    mimetypes.add_type('application/json', '.json')
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Use ThreadingTCPServer for better performance
    with socketserver.ThreadingTCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"Serving directory: {os.path.join(os.getcwd(), DIRECTORY)}")
        print("SPA routing enabled for /database/* paths")
        print("JSON files served with correct MIME type")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            sys.exit(0)
