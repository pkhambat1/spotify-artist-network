from queue import Queue


class Node:

    def __init__(self, id: str, name: str, popularity: int, image: str):
        self.id = id
        self.name = name
        self.popularity = popularity
        self.image = image

    def to_dict(self):
        return {"id": self.id, "name": self.name, "popularity": self.popularity, "image": self.image}


class GraphJson:

    def __init__(self):
        self.nodes = []
        self.links = []

    def to_dict(self) -> dict:
        return {"nodes": self.nodes, "links": self.links}

    def add(self, id: str, name: str, related_artists: list, breadth: int, visited: set, queue: Queue,
            num_nodes: int) -> None:
        related_nodes_count = 0
        for related_artist in related_artists:
            if related_nodes_count >= breadth or len(visited) >= num_nodes:
                break
            related_artist_id = related_artist[0]
            related_artist_name = related_artist[1]
            related_artist_popularity = related_artist[2]
            related_artist_image = related_artist[3]
            if related_artist_id not in visited:
                visited.add(related_artist_id)
                queue.put(related_artist)
                self.nodes.append(Node(related_artist_id, related_artist_name, related_artist_popularity, related_artist_image).to_dict())
                related_nodes_count += 1
            self.links.append({"source": id, "target": related_artist_id})
        print("added " + str(related_nodes_count) + " nodes.")
