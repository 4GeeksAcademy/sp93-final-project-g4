"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Bookings, CinemaRooms, ShowTimes, Movies, Sales, SalesLines, Products, Payments, Cart, CartItem
from flask_cors import CORS
import requests
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt
from datetime import datetime, timedelta
import Monei
from Monei import MoneiClient
from flask_cors import cross_origin
import json


APP_HOST = os.getenv("APP_HOST")

api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API

MONEI_BASE_URL = os.getenv("MONEI_BASE_URL")
api_key = os.getenv('MONEI_API_KEY')
monei_client = MoneiClient(api_key)


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


@api.route('/movies', methods=['GET'])
def movies():
    import_movies()
    # create_showtimes()
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
    cart_item = db.session.execute(db.select(CartItem)
                                   .where(CartItem.cart_id == cart.id, CartItem.product_id == product_id)).scalar()

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


@api.route('/api/cart/clear', methods=['DELETE'])
@cross_origin(origins="*")
def clear_cart():
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()

    if not cart:
        return jsonify({"message": "No cart found for this user"}), 200  #  Cambiamos el código de respuesta a 200 en lugar de 404

    db.session.delete(cart)
    db.session.commit()

    return jsonify({"message": "Cart cleared successfully"}), 200


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


@api.route('/store-cinema', methods=['POST'])
@jwt_required()
def store_cinema():
    data = request.json
    booking_ids = data.get('booking_ids')

    # Obtener usuario
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    print("Creando nueva venta para el usuario:", user.id)
    print("Booking IDs enviados:", booking_ids)

    # Validar si `booking_ids` está vacío
    if not booking_ids:
        print("Error: `booking_ids` está vacío.")  # 🆕 Diagnóstico
        return jsonify({"message": "No valid bookings found"}), 400

    # Obtener carrito
    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
    if not cart or not cart.items:
        print("Error: Carrito vacío.")  # 🆕 Diagnóstico
        return jsonify({"message": "Your cart is empty"}), 400

    print("Carrito antes de procesar venta:", cart.items)  # 🆕 Diagnóstico

    total = 0
    products_detail = []
    has_valid_items = False

    # Crear la venta
    new_sale = Sales(user_id=user.id, total=total)
    db.session.add(new_sale)

    # Validamos que `cart.items` tiene contenido válido
    for item in cart.items:
        if not item.serialize():
            print("Error: `item.serialize()` está vacío.")  # 🆕 Diagnóstico
            return jsonify({"message": "Invalid cart data"}), 422

        print("Guardando SalesLines - Producto/Reserva:", item.serialize())

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
            products_detail.append(item.serialize())

    if not has_valid_items:
        print("Error: No hay ítems válidos para la venta.")  # 🆕 Diagnóstico
        return jsonify({"message": "You don't have valid items to buy"}), 400

    # Vaciar el carrito
    for item in cart.items:
        db.session.delete(item)

    db.session.delete(cart)
    db.session.commit()

    print("Venta registrada correctamente, ID:", new_sale.id)  # 🆕 Diagnóstico

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


@api.route('/create-payment', methods=['POST'])
@jwt_required()
def create_payment():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    
    if not user:
        return jsonify({"message": "User not found"}), 400

    data = request.json
    booking_id = data.get('booking_id')

    print("Debug - Booking ID recibido en create-payment:", booking_id)

    response_body['bookings'] = user_bookings(user.id)
    response_body['bookings_ids'] = [b['id'] for b in response_body['bookings']]

    cart = db.session.execute(db.select(Cart).where(Cart.user_id == user.id)).scalar()
    if not cart:
        response_body['message'] = "Your shopping cart is empty"
        return response_body, 200

    items = db.session.execute(db.select(CartItem).where(CartItem.cart_id == cart.id)).scalars().all()
    total = sum(item.serialize()["subtotal"] for item in items)

    response_body['total'] = total

    payment_data = {
        "amount": int(total * 100),
        "currency": "EUR",
        "customer_email": user.email,
        "order_id": f"{user.id}-{'-'.join(str(b['id']) for b in response_body['bookings'])}-{datetime.utcnow().timestamp()}",
        "description": "Payed at CinemaCenter WebApp",
        "callbackUrl": f"{APP_HOST}/payment-success",
        "completeUrl": f"{APP_HOST}/payment-success",
        "return_url": f"{APP_HOST}/payment-success",
        "cancel_url": f"{APP_HOST}/"
    }

    payment_response = monei_client.payments.create(payment_data)

    new_payment = Payments(
        payment_id=payment_response.get("id"),
        amount=payment_response.get("amount"),
        currency="EUR",
        status=str(payment_response.get("status", "FAILED")),
        description=payment_response.get("description", ""),
        payment_method=str(payment_response.get("payment_method", {}).get("method", "")),  
        created_at=payment_response.get("created_at"),
        user_id=user.id
    )

    db.session.add(new_payment)
    db.session.commit()

    response_body["message"] = "Payment initiated successfully."
    response_body["your_payment_link"] = payment_response.get("next_action", {}).get("redirect_url", "No redirect URL provided")
    response_body["payment_id"] = new_payment.payment_id

    print("Debug - Datos enviados en response_body:", json.dumps(response_body))

    return response_body, 201 if new_payment.status in ["PENDING", "SUCCESS"] else 200


@api.route('/payment-status/<payment_id>', methods=['GET'])
@jwt_required()
def check_payment_status(payment_id):
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        response_body['message'] = 'User not found'
        return response_body, 400

    payment = db.session.execute(db.select(Payments).where(Payments.payment_id == payment_id, Payments.user_id == user.id)).scalar()
    if not payment:
        response_body["message"] = "Payment not found"
        return response_body, 404  

    payment_response = monei_client.payments.get(payment_id)  

    new_status = str(payment_response.get("status", payment.status))  
    new_method = str(payment_response.get("payment_method", {}).get("method", payment.payment_method)) 
    if payment.status != new_status or payment.payment_method != new_method:
        payment.status = new_status
        payment.payment_method = new_method  
        db.session.commit()
    payment_method = payment_response.get("payment_method", {})
    method_pay = str(payment_method.get("method", "Unknown"))  
    card_brand = str(payment_method.get("card", {}).get("brand", "Unknown"))  
    card_last4 = str(payment_method.get("card", {}).get("last4", "****"))  

    response_body.update({
    "message": "Payment status checked and updated",
    "description": payment_response.get("description", ""),
    "amount": payment_response.get("amount", ""),
    "currency": payment_response.get("currency", ""),
    "id": payment_response.get("id", ""),
    "payment_method": method_pay,  
    "card_brand": card_brand,  
    "card_last4": card_last4,  
    "status": str(payment.status),
    "status_code": payment_response.get("status_code", ""),
    "status_message": payment_response.get("status_message", "")
    })

    return jsonify(response_body), 200


@api.route('/user-transactions', methods=['GET'])
@jwt_required()
@cross_origin(origins="*")  
def get_user_transactions():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    if not user:
        response_body['message'] = 'User not found'
        return jsonify(response_body), 400

    #  Verificar manualmente en la BD si hay transacciones con payment_id
    query = db.session.execute(
        db.text("SELECT id, user_id, payment_id FROM sales WHERE user_id = :user_id"),
        {"user_id": user.id}
    )
    sales_data = query.fetchall()

    print(f" SQL Sales for {current_user_email}: {sales_data}")  

    
    sales = db.session.execute(db.select(Sales).where(Sales.user_id == user.id).order_by(Sales.sale_date.desc())).scalars()
    for sale in sales:
        print(f" Sale {sale.id}: payment_id={sale.payment_id}, payment_to={sale.payment_to}")  

    transactions_detail = []

    for sale in sales:
        payment = sale.payment_to

        #  Si payment_id existe pero `payment_to` es None, actualizamos la relación
        if sale.payment_id and not payment:
            payment = db.session.execute(db.select(Payments).where(Payments.payment_id == sale.payment_id)).scalar()
            sale.payment_to = payment
            db.session.commit()

        if not payment:
            print(f" Advertencia: `payment_to` es None para sale_id {sale.id} - Ignorando esta venta.")
            continue  

        transactions_detail.append({
            "payment_id": payment.payment_id,
            "status": payment.status,
            "amount": sale.total,
            "currency": payment.currency,
            "description": payment.description,
            "payment_method": payment.payment_method,
            "created_at": payment.created_at if payment else int(sale.sale_date.timestamp()),
        })

    response_body["message"] = "Payment History"
    response_body["transactions"] = transactions_detail

    print(f" Response Body: {response_body}")  # Verificamos la salida final

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


def user_bookings(user_id):

     bookings = db.session.execute(
         db.select(Bookings)
         .join(ShowTimes, Bookings.showtime_id == ShowTimes.id)
        .join(Movies, ShowTimes.movie_id == Movies.id)
         .join(CinemaRooms, ShowTimes.cinema_room_id == CinemaRooms.id)
         .where(Bookings.user_id == user_id)
     ).scalars()

     return [ booking.user_bookings() for booking in bookings]


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