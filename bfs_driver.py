from queue import Queue

from GraphJsonClass import GraphJson, Node
from spotify_requests import *


def num_nodes(breadth: int, depth: int) -> int:
    if breadth == 1:
        return depth + 1
    return (1 - breadth ** (depth + 1)) // (1 - breadth)


# Function to print a bfs of graph
def bfs(name: str, breadth: int, depth: int) -> dict:
    t = token()
    graphJson = GraphJson()
    # Clean up name
    artist = get_artist_by_name(name, t)
    print('artist', artist)
    seed = (artist['id'], artist['name'])
    visited_ids = {seed[0]}
    graphJson.nodes.append(Node(artist['id'], artist['name'], artist['popularity'], artist['images'][0]).to_dict())
    queue = Queue()
    max_nodes = num_nodes(breadth, depth)
    if depth < 1:
        graphJson.add(seed[0], seed[1], [], breadth, visited_ids, queue, max_nodes)
        return graphJson.to_dict()
    print('seed', seed)
    queue.put(seed)
    while not queue.empty():
        # Max visited_ids = breadth ^ depth
        if len(visited_ids) >= max_nodes:
            print(len(visited_ids))
            print(max_nodes)
            break
        deq = queue.get()
        artist_id = deq[0]
        artist_name = deq[1]
        related_artists = get_related_artists_by_id(artist_id, t)
        print("fetched " + str(len(related_artists)))
        # Add to graphJson
        graphJson.add(artist_id, artist_name, related_artists, breadth, visited_ids, queue, max_nodes)
    return graphJson.to_dict()

def get_artist_list(name: str):
    t = token()
    return get_all_artists_by_name(name, t)
