from queue import Queue

class Node:


    def __init__(self, name: str, popularity: int):
        self.name = name
        self.popularity = popularity


    def to_dict(self):
        return {"id": self.name, "popularity": self.popularity}

class GraphJson:


    def __init__(self):
        self.nodes = []
        self.links = []


    def to_dict(self) -> dict:
        return {"nodes": self.nodes, "links": self.links}


    def add(self, name: str, related_artists: list, breadth: int, visited: set, queue: Queue, num_nodes: int) -> None:
        related_nodes_count = 0
        for related_artist in related_artists:
            if related_nodes_count >= breadth or len(visited) >= num_nodes:
                break
            related_artist_id = related_artist[0]
            related_artist_name = related_artist[1]
            related_artist_popularity = related_artist[2]
            if related_artist_id not in visited:
                visited.add(related_artist_id)
                queue.put(related_artist)
                self.nodes.append(Node(related_artist_name, related_artist_popularity).to_dict())
                related_nodes_count += 1
            self.links.append({"source": name, "target": related_artist_name, "value": 1})
        print("added " + str(related_nodes_count) + " nodes.")
