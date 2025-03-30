"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Bookings, CinemaRooms, ShowTimes, Movies, Sales, SalesLines, Products
from flask_cors import CORS
import requests
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt
from datetime import datetime


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200


@api.route('/login', methods=["POST"])
def login():
    
    response_body = {}
    data = request.json
    """ print("soy el data del login: ", data) """
    email = data.get('email')
    password = data.get('password')
    row = db.session.execute(db.select(Users).where(Users.email == email, Users.password == password)).scalar()
    if not row:
        response_body['message'] = 'Wrong email/password'
        return response_body, 400
    user = row.serialize()
    """ print("soy el user: ", user) """
    claims = {"id": user['id'],
             "email": user['email'],
             "is_admin": user['is_admin']}
    print("login claims: ", claims)
    access_token = create_access_token(identity=email)
    response_body['message'] = 'User logged!'
    response_body['access_token'] = access_token
    response_body['results'] = user
    return response_body, 200
    

@api.route('/register', methods=['POST'])
def register():
    response_body = {}
    data = request.json
    
    row = Users(username=data.get("username", ""), email=data["email"], password=data["password"], is_admin=data.get("is_admin", False))
    db.session.add(row)
    db.session.commit()
    user = row.serialize()
    claims ={'id': user['id'],
             'is_admin': user['is_admin']}
    
    access_token = create_access_token(identity=user['email'], additional_claims=claims)
    response_body['message'] = 'New User Created'
    response_body['access_token'] = access_token
    response_body['results'] = user
    return response_body, 200


@api.route('/movies', methods=['GET'])
def movies():
    import_movies()
    response_body = {}
    movies = db.session.execute(db.select(Movies)).scalars()
    response_body["message"] = "List of movies"
    response_body["results"] = [movie.serialize() for movie in movies]
    return response_body, 200


@api.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    response_body = {}

    movie = db.session.execute(db.select(Movies).where(Movies.id == movie_id)).scalar()

    if not movie: 
        response_body["message"] = "Movie not found"
        return jsonify(response_body), 404

    response_body["message"] = "Movie details"
    response_body["result"] = movie.serialize()

    return jsonify(response_body), 200 


@api.route('/store-cinema', methods=['GET', 'POST'])
@jwt_required()
def store_cinema():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email== current_user_email)).scalar()

    bookings = user_bookings(user.id)

    if not bookings:
        response_body['message'] = 'You need to reserve a ticket before you can buy in our Cinema Store'
        return response_body, 400
    if request.method == 'GET':

        response_body = {
            "message": "Welcome to our Cinema Store! Here are your tickets:",
            "your tickets": bookings,
            "sales": get_sales(user.id)
        }

        return response_body, 200
    
    if request.method == 'POST':
        data = request.json
        selected_products = data.get('products', [])
        booking_id = data.get('booking_id')

        bookings = db.session.execute(db.select(Bookings).where(Bookings.id == booking_id, Bookings.user_id == user.id)).scalar()
        
        total = sum([db.session.execute(db.select(Products.base_price)
                                        .where(Products.id == product.get('id')))
                                        .scalar() * product.get('quantity') 
                                        for product in selected_products])

        if not bookings or bookings.showtime_to.date_time < datetime.utcnow(): 
            response_body['message'] = "The reservation does not exist or has expired"
            return response_body, 400

        if user.wallet < total:
            return {"message": "You don't have enough money in your wallet"}, 400

        user.wallet -= total

        new_sale = Sales(user_id=user.id, total=total)
        db.session.add(new_sale)

        products_detail = []

        for product in selected_products:
            product_selected = db.session.execute(db.select(Products).where(Products.id == product.get('id'))).scalar()
            if product_selected:
                new_sale_line = SalesLines(
                    product_id=product_selected.id,
                    quantity=product.get('quantity'),
                    unit_price=product_selected.base_price,
                    sale_id=new_sale.id
                )
                db.session.add(new_sale_line)

                products_detail.append({
                    'name': product_selected.name,
                    'quantity': product.get('quantity'),
                    'unit_price': product_selected.base_price,
                })

        bookings.sales.append(new_sale)  
        
        db.session.commit()

        response_body = {
            "message": "Your purchase is done! Here's your resume: ",
            "results": products_detail
        }
        return response_body, 201

    
@api.route('/book-ticket', methods=['POST'])
@jwt_required()
def book_ticket():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        return jsonify({'message': "User not found"}), 400

    data = request.json
    print('soy el data de book_ticket:', data)
    showtime_id = data.get('showtime_id')
    
    seats_booked = data.get('seats_booked', [])

    if showtime_id is None or not seats_booked:
        return jsonify({'message': 'Missing required fields'}), 400

    showtime = db.session.execute(db.select(ShowTimes).where(ShowTimes.id == showtime_id)).scalar()

    if not showtime:
        return jsonify({'message': 'Showtime not found'}), 404
    
    cinema_room = showtime.cinema_room_to
    
    for seat in seats_booked:
        row = seat.get('row')
        col = seat.get('col')
        if {"row": row, "col": col} in showtime.get_reserved_seats():
            return jsonify({'message': 'The seat is already reserved'}), 400
        if row < 1 or row > cinema_room.cinema_row or col < 1 or col > cinema_room.cinema_col:
            return jsonify({'message': 'Invalid seat selection'}), 400
        
        showtime.reserve_seat(row, col)
        showtime.available -= 1

         # Crear la reserva
        new_booking = Bookings(
            user_id=user.id,
            showtime_id=showtime_id,
            row=row,
            col=col,
            booking_price=5,
        )
        db.session.add(new_booking)
    
    db.session.commit()
    
    response_body['message'] = 'Booking successful'
    response_body['booking'] = new_booking.user_bookings()
        
    return jsonify(response_body), 200


@api.route('/showtime/<int:showtime_id>/seats', methods=['GET'])
def get_showtime_seats(showtime_id):
    response_body = {}
    showtime = db.session.execute(db.select(ShowTimes).where(ShowTimes.id == showtime_id)).scalar()
    if not showtime:
        return jsonify({'message': 'Showtime not found'}), 404

    response_body['details'] = showtime.serialize()

    return response_body, 200

@api.route('/products', methods=['GET', 'POST'])
# @jwt_required()
def products():
    response_body = {}
    if request.method == 'GET':
        results = db.session.execute(db.select(Products)).scalars()
        response_body['results'] = [row.serialize() for row in results]
        return response_body, 200


@api.route('/user-detail', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email==current_user_email)).scalar()
      
    if request.method == 'GET':
        response_body['user_details'] = {'user_name': user.username,
                                    'email': user.email,
                                    'wallet': user.wallet,
                                    'points': user.points}
        return response_body, 200
    
    if request.method == 'PUT':
        data = request.json
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        db.session.commit()
        response_body['message'] = 'Your Profile is Updated Successfully!'
        new_token = create_access_token(identity=user.email)
        response_body['new_token'] = new_token
        return response_body, 200
    

def import_movies():
    url = f'{os.getenv("URL_TMDB")}/now_playing'
    headers = {
        "accept": "application/json",
        "Authorization": f'Bearer {os.getenv("TOKEN_API_TMDB")}'
    }
    response = requests.get(url, headers=headers)
    movies = response.json().get("results", [])

    for movie in movies:
        url_details = f'{os.getenv("URL_TMDB")}/{movie["id"]}'
        response = requests.get(url_details, headers=headers)
        movie_details = response.json()
        tmdb_id = movie["id"]
        title = movie["title"]
        runtime = movie_details.get("runtime", 0) # La duracion smp va a ser 0 porque en la API al traer la lista de peliculas no tiene el atributo "runtime"
        overview = movie.get("overview", "")
        adult = movie["adult"]
        backdrop_path = movie["backdrop_path"]
        popularity = movie["popularity"]
        poster_path = movie["poster_path"]
        release_date = movie.get("release_date", None)
        genre_list = [g["name"] for g in movie_details.get("genres", [])]
        genre = ",".join(genre_list)
        movie_exist = db.session.execute(db.select(Movies).where(Movies.tmdb_id == tmdb_id)).scalar()
        if not movie_exist:
            new_movie = Movies(
                tmdb_id=tmdb_id, 
                title=title,
                runtime=runtime,
                overview=overview,
                adult=adult,
                backdrop_path=backdrop_path,
                popularity=popularity,
                poster_path=poster_path, 
                release_date=release_date,
                genre=genre)
            db.session.add(new_movie)

    db.session.commit()


def get_sales(user_id):
    sales = db.session.execute(db.select(Sales)
                               .where(Sales.user_id == user_id)
                               ).scalars()
    return [sale.serialize() for sale in sales]


def user_bookings(user_id):

    bookings = db.session.execute(
        db.select(Bookings)
        .join(ShowTimes, Bookings.showtime_id == ShowTimes.id)
        .join(Movies, ShowTimes.movie_id == Movies.id)
        .join(CinemaRooms, ShowTimes.cinema_room_id == CinemaRooms.id)
        .where(Bookings.user_id == user_id)
    ).scalars()

    return [ booking.user_bookings() for booking in bookings]
