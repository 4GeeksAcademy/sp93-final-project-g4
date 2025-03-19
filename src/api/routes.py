"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, Movies
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import requests
import os


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200


@api.route('/movies', methods=['GET'])
def movies():
    import_popular_movies()
    response_body = {}

    movies = db.session.execute(db.select(Movies)).scalars()
    response_body["message"] = "List of movies"
    response_body["results"] = [movie.serialize() for movie in movies]
    return response_body, 200


def import_popular_movies():
    url = os.getenv("URL_TMDB", "") + "/popular?language=en-US&page=1"
    headers = {
        "accept": "application/json",
        "Authorization": "Bearer " + os.getenv("TOKEN_API_TMDB", "")
    }

    response = requests.get(url, headers=headers)
    movies = response.json().get("results", [])

    for movie in movies:
        tmdb_id = movie["id"]
        title = movie["title"]
        duration = movie.get("duration", 0) # La duracion smp va a ser 0 porque en la API al traer la lista de peliculas no tiene el atributo "duration"
        overview = movie.get("overview", "")
        adult = movie["adult"]
        backdrop_path = movie["backdrop_path"]
        popularity = movie["popularity"]
        poster_path = movie["poster_path"]
        release_date = movie.get("release_date", None)

        movie_exist = db.session.execute(db.select(Movies).where(Movies.tmdb_id == tmdb_id)).scalar()
        if not movie_exist:
            new_movie = Movies(
                tmdb_id=tmdb_id, 
                title=title,
                duration=duration, 
                overview=overview,
                adult=adult,
                backdrop_path=backdrop_path,
                popularity=popularity,
                poster_path=poster_path, 
                release_date=release_date)
            db.session.add(new_movie)

    db.session.commit()
