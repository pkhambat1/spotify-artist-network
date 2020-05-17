import os
from bfs_driver import bfs

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/_get_artist_network', methods=['GET'])
def get_artist_network():
    artist = request.args.get('artist')
    breadth = int(request.args.get('breadth'))
    depth = int(request.args.get('depth'))
    print(breadth, depth)
    return jsonify(bfs(artist, breadth, depth))

if __name__ == '__main__':
    app.run(port=int(os.getenv('PORT', 8080)))
