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
    print('soy el data del register: ', data)
    row = Users(username=data.get("username", ""), email=data["email"], password=data["password"], is_admin=data.get("is_admin", False))
    db.session.add(row)
    db.session.commit()
    user = row.serialize()
    claims ={'id': user['id'],
             'is_admin': user['is_admin']}
    print('soy el claims del register: ', claims)
    access_token = create_access_token(identity=user['email'], additional_claims=claims)
    response_body['message'] = 'New User Created'
    response_body['access_token'] = access_token
    response_body['resuslts'] = user
    return response_body, 200


@api.route('/movies', methods=['GET'])
def movies():
    import_popular_movies()
    response_body = {}
    movies = db.session.execute(db.select(Movies)).scalars()
    response_body["message"] = "List of movies"
    response_body["results"] = [movie.serialize() for movie in movies]
    return response_body, 200


@api.route('/user-bookings', methods=['GET'])
@jwt_required()
def user_bookings():
    response_body = {}
    current_user = get_jwt_identity()

    user = db.session.execute(db.select(Users).where(Users.email==current_user)).scalar()
    bookings = db.session.execute(
        db.select(Bookings)
        .join(ShowTimes, Bookings.showtime_id == ShowTimes.id)
        .join(Movies, ShowTimes.movie_id == Movies.id)
        .join(CinemaRooms, ShowTimes.cinema_room_id == CinemaRooms.id)
        .where(Bookings.user_id == user.id)
    ).scalars()

    response_body['message'] = "List de bookings"
    response_body['results'] = [ booking.user_bookings() for booking in bookings]
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


@api.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    response_body = {}
    current_user = get_jwt_identity()

    user = db.session.execute(db.select(Users).where(Users.email==current_user)).scalar()

    if not user:
        response_body['message'] = "User dont found"
        return response_body, 404

    sales = db.session.execute(db.select(Sales)
                               .where(Sales.user_id == user.id)
                               ).scalars()

    response_body["message"] = "List of sales"
    response_body["results"] = [sale.serialize() for sale in sales]

    return jsonify(response_body), 200


@api.route('/store-cinema', methods=['GET', 'POST'])
@jwt_required()
def store_cinema():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email== current_user_email)).scalar()
    # En lugar de booking debo buscar en Sales
    bookings = db.session.execute(db.select(Bookings, Movies, ShowTimes, CinemaRooms)
                                    .join(ShowTimes, Bookings.showtime_id == ShowTimes.id)
                                    .join(Movies, ShowTimes.movie_id == Movies.id)
                                    .join(CinemaRooms, ShowTimes.cinema_room_id == CinemaRooms.id)
                                    .where(Bookings.user_id == user.id)).all()
    if not bookings:
        response_body['message'] = 'You need to reserve a ticket before you can buy in our Cinema Store'
        return response_body, 400
    if request.method == 'GET':
        
        reserved_tickets = [{'selected_movie': movie.title,
                                'movie_date': showtime.date_time.strftime("%Y-%m-%d %H:%M:%S"),
                                'cinema_room': cinema_room.name} for booking, movie, showtime, cinema_room in bookings]
       
            
        sales = db.session.execute(db.select(Sales, SalesLines, Products)
                               .where(Sales.user_id == user.id)
                               ).all()
        sale_list = [{'your_snacks': product.name,
                      'quantity': sale_line.quantity,
                      'price': sale_line.unit_price} for sale, sale_line, product in sales]
        response_body = {
            "message": "Wellcome to our Cinema Store! This are your tickets:",
            "your tickets": reserved_tickets,
            "sales":sale_list}
        
        return jsonify(response_body), 200
        
    if request.method == 'POST':
        data = request.json
        selected_products = data.get('product_id', [])
        if not selected_products:
            response_body['message'] = "You don't have any snacks yet. Get Some!"
            return response_body, 400
        
        total = sum([product.get('price') * product.get('quantity', 0) for product in selected_products])
        new_sale = Sales(user_id=user.id, total=total)
        db.session.add(new_sale)
        db.session.commit()

        for product in selected_products:
            product_selected = db.session.execute(db.select(Products).where(Products.name==product.get('name'))).scalar()
            if product_selected:
                new_sale_line = SalesLines(sale_id=new_sale.id,
                                           product_id=product_selected.id,
                                           quantity=product.get('quantity', 0),
                                           unit_price=product_selected.base_price)
                db.session.add(new_sale_line)
        db.session.commit()
        products_detail = [{'name': product.get('name'),
                            'quantity': product.get('quantity'),
                            'price':product.get('price')}for product in selected_products]

        response_body['message'] = "Your purchase is done! Here's your resume: "
        response_body['results'] = products_detail
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
    showtime_id = data.get('showtime_id')
    row = data.get('row')
    col = data.get('col')

    if showtime_id is None or row is None or col is None:
        return jsonify({'message': 'Missing required fields'}), 400
    
    showtime = db.session.execute(db.select(ShowTimes).where(ShowTimes.id == showtime_id)).scalar()
    if not showtime:
        return jsonify({'message': 'Showtime not found'}), 404
    
    if showtime.available <= 0:
        return jsonify({'message': 'No ticket available'}), 400
    
    cinema_room = showtime.cinema_room_to
    if row < 1 or row > cinema_room.cinema_row or col < 1 or col > cinema_room.cinema_col:
        return jsonify({'message': 'Invalid seat selection'}), 400
    
    existing_booking = db.session.execute(
        db.select(Bookings).where(
            Bookings.showtime_id == showtime_id,
            Bookings.row == row,
            Bookings.col == col
        )
    ).scalar()
    
    if existing_booking:
        return jsonify({'message': 'The seat is already reserved'}), 400
    
    new_booking = Bookings(
        user_id = user.id,
        showtime_id = showtime_id,
        row = row,
        col = col,
        booking_price = 5  # Preguntar el precio que quieren
    )

    db.session.add(new_booking)

    # Si es el 1er asiento que se compra, crear un sales, y crear un sales_line con quantity 1
    # Si no es el 1ro, buscar el sales_line y sum +1 y sum el precio
    showtime.available -= 1
    db.session.commit()

    response_body['message'] = 'Booking successful'
    response_body['booking'] = new_booking.user_bookings()

    return jsonify(response_body), 200


@api.route('/products', methods=['GET', 'POST'])
# @jwt_required()
def products():
    response_body = {}
    if request.method == 'GET':
        results = db.session.execute(db.select(Products)).scalars()
        response_body['results'] = [row.serialize() for row in results]
        return response_body, 200

def import_popular_movies():
    url = f'{os.getenv("URL_TMDB")}/popular?language=en-US&page=1'
    headers = {
        "accept": "application/json",
        "Authorization": f'Bearer {os.getenv("TOKEN_API_TMDB")}'
    }

    response = requests.get(url, headers=headers)
    movies = response.json().get("results", [])
    

    for movie in movies:
        tmdb_id = movie["id"]
        title = movie["title"]
        runtime = movie.get("runtime", 0) # La duracion smp va a ser 0 porque en la API al traer la lista de peliculas no tiene el atributo "runtime"
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
                runtime=runtime, 
                overview=overview,
                adult=adult,
                backdrop_path=backdrop_path,
                popularity=popularity,
                poster_path=poster_path, 
                release_date=release_date)
            db.session.add(new_movie)

    db.session.commit()


