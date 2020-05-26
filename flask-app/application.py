from bfs_driver import bfs, get_artist_list

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

@app.route('/_get_artist_list', methods=['GET'])
def get_artists():
    print('get artists')
    name = request.args.get('name')
    return jsonify(get_artist_list(name))

if __name__ == '__main__':
    app.run()
