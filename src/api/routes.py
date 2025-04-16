"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Bookings, CinemaRooms, ShowTimes, Movies, Sales, SalesLines, Products, Cart, CartItem
from flask_cors import CORS
import requests
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt
from datetime import datetime, timedelta
import qrcode
import io
import base64


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200

def generate_qr_code(data: str) -> str:
    qr = qrcode.make(data)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    img_str = base64.b64encode(buffer.read()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

@api.route('/login', methods=["POST"])
def login():
    
    response_body = {}
    data = request.json
    """ print("soy el data del login: ", data) """
    email = data.get('email')
    # id = data.get('id')
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
    access_token = create_access_token(identity=user['email'], additional_claims=claims)
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
    claims = {"id": user['id'],
             "email": user['email'],
             "is_admin": user['is_admin']}   
    access_token = create_access_token(identity=user['email'], additional_claims=claims)
    response_body['message'] = 'New User Created'
    response_body['access_token'] = access_token
    response_body['results'] = user
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


@api.route('/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    response_body = {}
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return {"message": "Product ID is required"}, 400
    
    product = db.session.execute(
        db.select(Products).where(Products.id == product_id)
    ).scalar()

    if not product:
        return {"message": "Product not found"}, 404


    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    # Obtener o crear el carrito
    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
    if not cart:
        cart = Cart(user_id=user.id)
        db.session.add(cart)
        db.session.commit()        

    # Verificar si el producto ya está en el carrito
    cart_item = db.session.execute(
        db.select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    ).scalar()

    if cart_item:
        cart_item.quantity += quantity
    else:
        new_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=1)
        db.session.add(new_item)

    db.session.commit()
    response_body["message"] = "Product added to cart"
    return response_body, 200


@api.route('/book-ticket', methods=['POST'])
@jwt_required()
def book_ticket():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        return jsonify({'message': "User not found"}), 400
    
    data = request.json
    print('book-ticket data:', data)
    showtime_id = data.get('showtime_id')
    seats_booked = data.get('seats_booked', [])

    if showtime_id is None or not seats_booked:
        return jsonify({'message': 'Missing required fields'}), 400

    showtime = db.session.execute(db.select(ShowTimes).where(ShowTimes.id == showtime_id)).scalar()
    if not showtime:
        return jsonify({'message': 'Showtime not found'}), 404
    
    cinema_room = showtime.cinema_room_to
    new_bookings = []
    
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

        new_bookings.append(new_booking)

    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
    if not cart:
        cart = Cart(user_id=user.id)
        db.session.add(cart)
        db.session.commit()

    for booking in new_bookings:
        new_cart_item = CartItem(
            cart_id=cart.id,
            booking_id=booking.id
        )
        print('este es el print',booking.id)
        db.session.add(new_cart_item)
        db.session.commit()

    response_body['message'] = 'Bookings added to cart'    
    return jsonify(response_body), 200


@api.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    current_user_email = get_jwt_identity()
    
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    if not user:
        return {"message": "User not found"}, 404
    
    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()

    if not cart:
        return {"message": "Cart not found"}, 404
    
    for item in cart.items:
        if item.booking_id:
            booking = item.booking_to_cart
            if booking and not booking.sales:
                showtime = booking.showtime_to
                showtime.unreserve_seat(booking.row, booking.col)
                db.session.delete(booking)
        db.session.delete(item)


    db.session.execute(db.delete(CartItem).where(CartItem.cart_id == cart.id))
    
    db.session.delete(cart)
    db.session.commit()

    return {"message": "Cart cleared successfully"}, 200


@api.route('/cart', methods=['GET'])
@jwt_required()
def view_cart():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
    if not cart:
        response_body['message'] = "Cart is empty"
        return response_body, 200

    items = db.session.execute(db.select(CartItem).where(CartItem.cart_id == cart.id)).scalars().all()

    products = []
    bookings = []
    total = 0

    for item in items:
        if item.serialize()["type"] == "Product":
            products.append(item.serialize())
        elif item.serialize()["type"] == "Booking":
            bookings.append(item.serialize())
        total += item.serialize()["subtotal"]

    response_body['products'] = products
    response_body['bookings'] = bookings
    response_body['total'] = total

    return response_body, 200


@api.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    current_user_email = get_jwt_identity()
    user = db.session.execute(
        db.select(Users).where(Users.email == current_user_email)
    ).scalar()

    sales = db.session.execute(
        db.select(Sales).where(Sales.user_id == user.id)
    ).scalars()

    return jsonify([sale.serialize() for sale in sales]), 200


@api.route('/store-cinema', methods=['POST'])
@jwt_required()
def store_cinema():
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    if request.method == 'POST':
        data = request.json
        booking_id = data.get('booking_id')

        bookings = db.session.execute(db.select(Bookings).where(
            Bookings.id == booking_id, 
            Bookings.user_id == user.id)
        ).scalar()

        if not bookings or bookings.showtime_to.date_time < datetime.utcnow():
            return {"message": "The reservation does not exist or has expired"}, 400

        cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
        if not cart or not cart.items:
            return {"message": "Your cart is empty"}, 400

        total = 0
        products_detail = []
        has_valid_items = False

        new_sale = Sales(user_id=user.id)

        for item in cart.items:
            if item.product_to_cart:
                product = item.product_to_cart
                subtotal = item.quantity * product.base_price
                total += subtotal
                has_valid_items = True

                new_sale_line = SalesLines(
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.base_price,
                    sale=new_sale
                )
                db.session.add(new_sale_line)
                products_detail.append(item.serialize())

            elif item.booking_to_cart:
                booking = item.booking_to_cart
                subtotal = booking.booking_price
                total += subtotal
                has_valid_items = True

                new_sale_line = SalesLines(
                    booking_id=booking.id,
                    quantity=1,
                    unit_price=booking.booking_price,
                    sale=new_sale
                )
                db.session.add(new_sale_line)

                # Genera el código QR
                qr_data = f"Booking ID: {booking.id} | Movie: {booking.showtime_to.movie_to.title} | Room: {booking.showtime_to.cinema_room_to.name} | Time: {booking.showtime_to.date_time.strftime('%Y-%m-%d %H:%M')}"
                qr_image = generate_qr_code(qr_data)

                # Guarda el QR en la base de datos
                booking.qr_code = qr_image

                item_serialized = item.serialize()
                item_serialized["qr_code"] = qr_image
                products_detail.append(item_serialized)
        
        new_sale.total = total

        if not has_valid_items:
            return {"message": "You don't have valid items to buy"}, 400

        db.session.add(new_sale_line)
        bookings.sales.append(new_sale)

        for item in cart.items:
            db.session.delete(item)

        db.session.commit()

        return {
            "message": "Your purchase is done! Here's your resume:",
            "results": products_detail,
            "total": total
        }, 201


@api.route('/showtime/<int:showtime_id>/seats', methods=['GET'])
def get_showtime_seats(showtime_id):
    response_body = {}
    showtime = db.session.execute(db.select(ShowTimes).where(ShowTimes.id == showtime_id)).scalar()
    if not showtime:
        return jsonify({'message': 'Showtime not found'}), 404

    response_body['details'] = showtime.serialize()

    return response_body, 200


@api.route('/products', methods=['GET'])
@jwt_required()
def products():
    create_cinema_menus()
    response_body = {}
    if request.method == 'GET':
        results = db.session.execute(db.select(Products)).scalars()
        response_body['results'] = [row.serialize() for row in results]
        return response_body, 200


@api.route('/users/<int:id>', methods=['GET', 'PUT'])
@jwt_required()
def user_profile(id):
    response_body = {}
    current_user_id = get_jwt()["id"]
    if current_user_id != id: 
        response_body["message"] = "Error: unauthorization"
        return response_body, 404
    user = db.session.execute(db.select(Users).where(Users.id == current_user_id)).scalar()
    if not user: 
        response_body["message"] = "usuario no existe"
        return response_body, 400 
    if request.method == 'GET':
        response_body['user_details'] = {'user_name': user.username,
                                    'email': user.email,
                                    'wallet': user.wallet,
                                    'points': user.points}
        return response_body, 200
    
    if request.method == 'PUT':
        data = request.json or {}
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        db.session.commit()
        response_body['message'] = 'Your Profile is Updated Successfully!'
        response_body['results'] = user.serialize()
        return response_body, 200
    

@api.route('/showtime/<int:movie_id>/details', methods=['GET'])
def showtime_details(movie_id):
    response_body = {}
    showtimes = db.session.execute(db.select(ShowTimes).where(ShowTimes.movie_id == movie_id)).scalars()

    if not showtimes:
        return jsonify({'message': 'Showtime not found'}), 404

    response_body['showtime'] = [showtime.serialize() for showtime in showtimes]
    return jsonify(response_body), 200


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
        genre = ", ".join(genre_list)

        trailer = None
        url_videos = f'{os.getenv("URL_TMDB")}/{tmdb_id}/videos'
        videos_response = requests.get(url_videos, headers=headers)

        if videos_response.status_code == 200:
            videos_data = videos_response.json()
            for video in videos_data.get("results", []):
                print(f"🔹 {video.get('name')} | type: {video.get('type')} | site: {video.get('site')}")

            trailers = sorted([
            video for video in videos_data.get("results", [])
            if video["site"] == "YouTube" and video["type"] == "Trailer"
        ], key=lambda trailer: (
            'official' not in trailer["name"].lower(),
            'teaser' in trailer["name"].lower(),
            len(trailer["name"])
        ))
        if trailers:
            trailer = trailers[0]["key"]

        url_credits = f'{os.getenv("URL_TMDB")}/{tmdb_id}/credits'
        credits_response = requests.get(url_credits, headers=headers)
        credits_data = credits_response.json()

        cast = credits_data.get("cast", [])[:5]
        actors = ", ".join([actor["name"] for actor in cast])

        crew =credits_data.get("crew", [])
        director = next((member["name"] for member in crew if member["job"] == "Director"), None)

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
                genre=genre,
                trailer=trailer,
                actors=actors,
                director=director)
            db.session.add(new_movie)
        else:
            movie_exist.trailer = trailer
            movie_exist.actors = actors
            movie_exist.director = director

    db.session.commit()


@api.route('/movies', methods=['GET'])
def movies():
    import_movies()
    response_body = {}
    movies = db.session.execute(db.select(Movies)).scalars()
    response_body["message"] = "List of movies"
    response_body["results"] = [movie.serialize() for movie in movies]
    return response_body, 200


def create_cinema_menus():

    combos = [
        Products(name="Classic Combo", base_price=9.99,
                 description="Includes one medium popcorn and a soft drink"),
        Products(name="Sweet Tooth Combo", base_price=7.99,
                 description="Includes a bag of candy and a small popcorn"),
        Products(name="Family Combo", base_price=19.99,
                 description="Includes one large popcorn, two soft drinks, and one candy")
    ]

    for combo in combos:
        exists = db.session.execute(
            db.select(Products).where(Products.name == combo.name)
        ).scalar()

        if not exists:
            db.session.add(combo)

    db.session.commit()


# def get_sales(user_id):
#     sales = db.session.execute(db.select(Sales)
#                                .where(Sales.user_id == user_id)
#                                ).scalars()
#     return [sale.serialize() for sale in sales]


# def user_bookings(user_id):

#     bookings = db.session.execute(
#         db.select(Bookings)
#         .join(ShowTimes, Bookings.showtime_id == ShowTimes.id)
#         .join(Movies, ShowTimes.movie_id == Movies.id)
#         .join(CinemaRooms, ShowTimes.cinema_room_id == CinemaRooms.id)
#         .where(Bookings.user_id == user_id)
#     ).scalars()

#     return [ booking.user_bookings() for booking in bookings]


def create_showtimes ():

    theater1 = CinemaRooms(
        name="First",
        capacity=50,
        cinema_col=10,
        cinema_row=5
    )

    db.session.add(theater1)
    db.session.commit()

    movie = db.session.execute(db.select(Movies).limit(1)).scalar()

    date_time = datetime.now() + timedelta(hours=2)

    showtime = ShowTimes(
        date_time=date_time,
        movie_id=movie.id,
        cinema_room_id=theater1.id,
        available=theater1.capacity 
    )

    db.session.add(showtime)
    db.session.commit()