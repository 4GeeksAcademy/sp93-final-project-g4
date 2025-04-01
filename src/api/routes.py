"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Bookings, CinemaRooms, ShowTimes, Movies, Sales, SalesLines, Products, Payments
from flask_cors import CORS
import requests
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt
from datetime import datetime
import square
from square.client import Client


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
    print('book-ticket data:', data)
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


square_client = Client(
    access_token= os.getenv("SQUARE_ACCESS_TOKEN"),            # Token de acceso desde la configuración
    environment= "sandbox"                                     # Cambiar a : "production" cuando estemos en un entorno real 
)                                                              #             "sandox" es para probar


@api.route('/create-order', methods=['POST'])                 # Vamos a crear una orden de compra
@jwt_required()  
def create_order():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    data = request.json  
    selected_products = data.get('products', []) 

    if not selected_products:
        response_body['message'] = "No products selected"
        return jsonify(response_body), 400  
    
    total = sum([db.session.execute(db.select(Products.base_price)
                           .where(Products.id == product.get('id'))).scalar() * product.get('quantity') for product in selected_products
    ])
    
    new_sale = Sales(user_id=user.id, total=total)          # Creamos la orden en nuestra BD
    db.session.add(new_sale)
    
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

    db.session.commit() 

    response_body["message"] = "Order created successfully!"
    response_body["order_id"] = new_sale.id
    response_body["total"] = total
    return jsonify(response_body), 201


@api.route('/process-payment', methods=['POST'])              # Vamos a procesar pagos con Square
@jwt_required()  
def process_payment():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()

    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    data = request.json  
    source_id = data.get("source_id")    # Token de la tarjeta generado en el frontend por Square
    order_id = data.get("order_id")      # ID de la orden de compra creada previamente
    amount = data.get("amount")          # Monto del pago en centavos (ejemplo: 2500 = $25.00)
    currency = "USD"  

    if not source_id or not order_id or not amount:
        response_body['message'] = "Missing payment details"
        return jsonify(response_body), 400  

    result = square_client.payments.create_payment({      # Llamamos a Square
        "idempotency_key": str(order_id),                 # Generamos una clave única para evitar pagos duplicados
        "source_id": source_id, 
        "amount_money": {
            "amount": amount,  
            "currency": currency  
        }
    })

    if result.is_success():
        payment_id = result.body["payment"]["id"]   # ID único del pago en Square
        new_payment = Payments(                     # Guardamos el pago en la BD
            payment_id=payment_id,
            amount=amount / 100,                    # Convertimos centavos a dólares
            currency=currency,
            status="COMPLETED",
            user_id=user.id                         # Asociamos el pago con el usuario autenticado
        )
        db.session.add(new_payment)
        db.session.commit()

        response_body['message'] = "Payment processed successfully!"
        response_body['payment_id'] = payment_id

        return jsonify(response_body), 200
    
    response_body['message'] = "Payment failed"
    response_body['errors'] = result.errors

    return jsonify(response_body), 400


@api.route('/create-invoice', methods=['POST'])               # Vamos a generar facturas
@jwt_required()
def create_invoice():
    response_body = {}
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    data = request.json  
    order_id = data.get('order_id')
    order = db.session.execute(db.select(Sales).where(Sales.id == order_id, Sales.user_id == user.id)).scalar()

    if not order:
        response_body['message'] = "Order not found"
        return jsonify(response_body), 400

    
    invoice_body = {                                                    # Construimos la factura en Square
        "idempotency_key": str(order_id),                               # idempotency_key => Evita duplicaciones
        "order_id": order_id,
        "location_id": os.getenv("SQUARE_LOCATION_ID"),
        "primary_recipient": {
            "customer_id": user.email  
        }
    }

    result = square_client.invoices.create_invoice(invoice_body)         # Llamamos a Square
    if result.is_success():                                              # Si la factura se genera correctamente
        response_body['message'] = "Invoice created successfully!"
        response_body['invoice_id'] = result.body["invoice"]["id"]
        return jsonify(response_body), 201
                                                                  
    response_body['message'] = "Invoice creation failed"                  # Si hay un error en la generación de la factura
    response_body['errors'] = result.errors
    return jsonify(response_body), 400


@api.route('/validate-payment', methods=['POST'])             # Vamos a validar el estado de un pago
@jwt_required()  
def validate_payment():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    data = request.json  
    payment_id = data.get('payment_id')
    
    payment = db.session.execute(db.select(Payments)                   # Verificamos que el pago existe en nuestra BD
                                 .where(Payments.payment_id == payment_id, Payments.user_id == user.id)).scalar()
    if not payment:
        response_body['message'] = "Payment not found in database"
        return jsonify(response_body), 400  

    result = square_client.payments.get_payment(payment_id)            # Consultar el estado del pago directamente en Square
    if result.is_success():
        square_status = result.body["payment"]["status"]               # Estado del pago en Square

        response_body['message'] = "Payment validation successful!"    
        response_body['database_status'] = payment.status              # Comparamos el estado en nuestra BD con el estado en Square
        response_body['square_status'] = square_status
        response_body['amount'] = payment.amount
        response_body['currency'] = payment.currency
        return jsonify(response_body), 200

    response_body['message'] = "Payment validation failed"             # Si hay un error en la validación con Square
    response_body['errors'] = result.errors
    return jsonify(response_body), 400


@api.route('/finalize-payment-process', methods=['PUT'])      # Vamos a finalizar un pago
@jwt_required()  
def finalize_payment_process():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    data = request.json  
    payment_id = data.get('payment_id')
    payment = db.session.execute(db.select(Payments)    # Verificamos que el pago existe en nuestra BD según el "payment_id" que obtuvimos
                                 .where(Payments.payment_id == payment_id, Payments.user_id == user.id)).scalar()
    if not payment:
        response_body['message'] = "Payment not found"
        return jsonify(response_body), 404  
    
    if payment.status not in ["COMPLETED"]:      # Validamos que el pago esté en un estado que permita su finalización (no hacemos Refunded=Devoluciones)
                                             # en este caso solo utilizamos "COMPLETED", pero de igual manera se podria usar para ["COMPLETED", "REFUNDED"]
        response_body['message'] = "Only completed payments can be finalized"
        return jsonify(response_body), 400 # Bloqueamos estados no permitidos para finalización

    
    payment.status = "FINALIZED"                  # Una vez el status del pago pasa a "FINALIZED", no se aceptaran futuras modificaciones
    db.session.commit()

    response_body['message'] = "Payment has been finalized successfully!"
    response_body['payment_id'] = payment_id
    return jsonify(response_body), 200


@api.route('/reconcile-payments', methods=['PUT'])            # Vamos a sincronizar pagos con Square y nuestra BD
@jwt_required()  
def reconcile_payments():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    payments = db.session.execute(db.select(Payments)                      # Obtener todos los pagos registrados del usuario
                                  .where(Payments.user_id == user.id)).scalars()
    if not payments:                                                       
        response_body['message'] = "No payments found for reconciliation"
        return jsonify(response_body), 404

    updated_payments = []                                        # En este Array/Lista guardaremos los pagos cuya información fue actualizada
    for payment in payments:
        result = square_client.payments.get_payment(payment.payment_id)    # Llamamos a Square y consultamos el estado del pago
        if result.is_success():
            square_status = result.body["payment"]["status"]               # Square nos devuelve el estado del pago (puede diferir en nuestra BD)

            if payment.status != square_status:                            # Si el estado en Square es diferente, actualizamos nuestra BD
                payment.status = square_status
                updated_payments.append(payment.serialize())

    if updated_payments:                                                   # Si hubo actualizaciones, guardamos los cambios en la BD
        db.session.commit()

    response_body['message'] = "Payment reconciliation completed!"
    response_body['updated_payments'] = updated_payments
    return jsonify(response_body), 200


""" @api.route('/get-finalized-payments', methods=['GET'])        # Vamos a listar pagos finalizados del cliente
@jwt_required()  
def get_finalized_payments():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400  

    
    finalized_payments = db.session.execute(                   # Obtener todos los pagos que han sido finalizados por el usuario
        db.select(Payments).where(Payments.user_id == user.id, Payments.status == "FINALIZED")).scalars()
    if not finalized_payments:
        response_body['message'] = "No finalized payments found"
        return jsonify(response_body), 404

    response_body['message'] = "Finalized payments retrieved successfully!"
    response_body['finalized_payments'] = [payment.serialize() for payment in finalized_payments]
    return jsonify(response_body), 200 """


@api.route('/get-invoices', methods=['GET'])                  # Consultamos las facturas del cliente
@jwt_required() 
def get_invoices():
    response_body = {}  
    current_user_email = get_jwt_identity()
    user = db.session.execute(db.select(Users).where(Users.email == current_user_email)).scalar()
    if not user:
        response_body['message'] = "User not found"
        return jsonify(response_body), 400 
    
    invoices = db.session.execute(db.select(Payments)                                 # Obtener todas las facturas del usuario
                                  .where(Payments.user_id == user.id)).scalars()
    if not invoices:                                                                  # Validamos si el usuario tiene facturas registradas
        response_body['message'] = "No invoices found"
        return jsonify(response_body), 404

    response_body['message'] = "Invoices retrieved successfully!"
    response_body['invoices'] = [invoice.serialize() for invoice in invoices]
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
