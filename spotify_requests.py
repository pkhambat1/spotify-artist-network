import json
# from config import SPOTIFY_CLIENT_AUTH
import os
import requests
def token() -> str:
    url = "https://accounts.spotify.com/api/token"
    data = {'grant_type': 'client_credentials'}
    headers = {
        'Authorization': f"Basic {os.environ['SPOTIFY_CLIENT_AUTH']}",
        # 'Authorization': f"Basic {SPOTIFY_CLIENT_AUTH}",
    }
    response = requests.request("POST", url, headers=headers, data=data)
    print(response)
    json = response.json()
    jprint(json)
    return json['access_token']

def jprint(json_object) -> None:
    print(json.dumps(json_object, indent=2))

def fprint(json_object: dict, filename: str) -> None:
    f = open(filename, "w")
    f.write(json.dumps(json_object, indent=2))
    f.close()

def get_related_artists_by_id(artist_id, token) -> list:
    url = f"https://api.spotify.com/v1/artists/{artist_id}/related-artists"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    json = response.json()
    # jprint(json)
    artists = json['artists']
    related = []
    for artist in artists:
        related.append((artist['id'], artist['name'], artist['popularity'], artist['images'][0]))
    return related

def get_related_artists_by_name(artist_name, token) -> list:
    if not get_artist_id(artist_name, token):
        return []
    artist_id = get_artist_id(artist_name, token)
    url = f"https://api.spotify.com/v1/artists/{artist_id}/related-artists"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    json = response.json()
    artists = json['artists']
    related = []
    for artist in artists:
        related.append((artist['id'], artist['name']))
    return related

def get_artist(id, token) -> dict:
    url = f"https://api.spotify.com/v1/artists/{id}"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    return response.json()

def get_artist_by_name(name, token) -> dict:
    url = f"https://api.spotify.com/v1/search?q={name}&type=artist"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    json = response.json()
    if len(json['artists']['items']) == 0:
        return {}
    return json['artists']['items'][0]

def get_all_artists_by_name(name, token) -> dict:
    url = f"https://api.spotify.com/v1/search?q={name}&type=artist"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    json = response.json()
    return json['artists']['items']

def get_artist_id(artist, token) -> str:
    url = f"https://api.spotify.com/v1/search?q={artist}&type=artist"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.request("GET", url, headers=headers)
    json = response.json()
    if len(json['artists']['items']) == 0:
        return ''
    return json['artists']['items'][0]['id']
