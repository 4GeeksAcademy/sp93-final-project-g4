from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json 

db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    points = db.Column(db.Integer, default=0)
    wallet = db.Column(db.Float, default=0)
    is_admin = db.Column(db.Boolean(), nullable=False)
 
    def __repr__(self):
        return f'<User email:{self.email} - name: {self.username} - id:{self.id}>'

    def serialize(self):
        return {'id': self.id,
                'username': self.username,
                'email': self.email,
                'password': self.password,
                'points': self.points,
                'wallet': self.wallet,
                'is_admin': self.is_admin}


class Bookings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow())
    booking_price = db.Column(db.Float, default=5)
    user_id = db.Column(db.Integer,db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref=db.backref('user_booking'), lazy='select')
    showtime_id = db.Column(db.Integer, db.ForeignKey('show_times.id'), nullable=False)
    showtime_to = db.relationship('ShowTimes', foreign_keys=[showtime_id], backref=db.backref('showtime_booking'), lazy='select')
    col = db.Column(db.Integer)
    row = db.Column(db.Integer)
    sales = db.relationship('Sales', backref='booking_sales', lazy=True)
    

    def __repr__(self):
        return f'<Booking id: {self.id}>'
    
    def user_bookings(self):
        return {
            "booking_date": self.booking_date.strftime("%d/%m/%Y %H:%M"),
            "row": self.row,
            "col": self.col,
            "booking_price": self.booking_price,
            "movie_title": self.showtime_to.movie_to.title,
            "showtime_date":self.showtime_to.date_time.strftime("%d/%m/%Y %H:%M"),
            "cinema_room_name": self.showtime_to.cinema_room_to.name,
            "sales_id": [sale.id for sale in self.sales]}


class CinemaRooms(db.Model):
    __tablename__ = "cinema_rooms"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    cinema_col = db.Column(db.Integer, default=5)
    cinema_row = db.Column(db.Integer, default=5)

    def __repr__(self):
        return f'<Cinema Rooms: Name:{self.name} - {self.id}'
    
    def serialize(self):
        return{ 'id': self.id,
                'name': self.name,
                'capacity': self.capacity,
                'cinema_col': self.cinema_col,
                'cinema_row': self.cinema_row}


class ShowTimes(db.Model):
    tablename = "show_times"
    id = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.DateTime)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    movie_to = db.relationship('Movies', foreign_keys=[movie_id], backref=db.backref('showtime_movie'), lazy='select')
    cinema_room_id = db.Column(db.Integer, db.ForeignKey('cinema_rooms.id'), nullable=False)
    cinema_room_to = db.relationship('CinemaRooms', foreign_keys=[cinema_room_id], backref=db.backref('showtime_room'), lazy='select')
    available = db.Column(db.Integer, default=25)

    reserved_seats = db.Column(db.Text, default="[]")

    def get_reserved_seats(self):
        if not self.reserved_seats:
            return []
        return json.loads(self.reserved_seats)

    def reserve_seat(self, row, col):
        reserved = self.get_reserved_seats()
        reserved.append({"row": row, "col": col})
        self.reserved_seats = json.dumps(reserved)

    def unreserve_seat(self, row, col):
        reserved = self.get_reserved_seats()
        updated_reserved = [seat for seat in reserved if not (seat['row'] == row and seat['col'] == col)]

        if len(reserved) != len(updated_reserved):  
            self.available += 1
        self.reserved_seats = json.dumps(updated_reserved)

    def repr(self):
        return f'<Show Time: date time: {self.date_time} - movie : {self.movie_id}'

    def serialize(self):
        return{ 'id': self.id,
                'date_time_hour': self.date_time.strftime("%H:%M"),
                'date_time_day': self.date_time.strftime("%d/%m"),
                'movie_id': self.movie_id,
                'cinema_room': self.cinema_room_to.name,
                'available_seats': self.available,
                'col_max': self.cinema_room_to.cinema_col,
                'row_max': self.cinema_room_to.cinema_row,
                "reserved_seats": self.get_reserved_seats(),
                }


class Movies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True)
    title = db.Column(db.String, nullable=False)
    runtime = db.Column(db.Integer, nullable=False)
    overview = db.Column(db.String)
    adult = db.Column(db.Boolean)
    backdrop_path = db.Column(db.String)
    popularity = db.Column(db.Float)
    poster_path = db.Column(db.String)
    release_date = db.Column(db.String)
    genre = db.Column((db.String), nullable=True)
    trailer = db.Column((db.String), nullable=True)

    def __repr__(self):
        return f'<Movies: title{self.title}'
    
    def serialize(self):
        return{ 'id': self.id,
                'tmdb_id': self.tmdb_id,
                'title': self.title,
                'runtime': self.runtime,
                'overview': self.overview,
                'adult': self.adult,
                'backdrop_path': self.backdrop_path,
                'popularity': self.popularity,
                'poster_path': self.poster_path,
                'release_date': self.release_date,
                'genre': self.genre,
                'trailer': self.trailer}


class Sales(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow())
    discount = db.Column(db.Float)
    total = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_to = db.relationship('Users', foreign_keys=[user_id], backref=db.backref('sales'), lazy='select')
    sales_lines_to = db.relationship('SalesLines', backref='sale', lazy="select")
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)

    def __repr__(self):
        return f'<Sales: Sale Date{self.sale_date}'
    
    def serialize(self):
        return{'sale_id': self.id,
                'sale_date': self.sale_date.strftime("%d/%m/%Y %H:%M"),
                'sales_lines': [sale_line.serialize() for sale_line in self.sales_lines_to],
                'discount': self.discount,
                'total': self.total,}


class SalesLines(db.Model):
    __tablename__ = "sales_lines"
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer)
    unit_price = db.Column(db.Float)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    product_to = db.relationship('Products', foreign_keys=[product_id], backref=db.backref('sales_lines', lazy='select'))
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    booking_to = db.relationship('Bookings', foreign_keys=[booking_id], backref=db.backref('sales_lines', lazy='select'))

    def __repr__(self):
        return f'<Sales Lines: {self.id}'
    
    def serialize(self):
        return{ 'quantity': self.quantity,
                'unit_price': self.unit_price,
                'product': self.product_to.name,
                'booking': self.booking_to.showtime_to.movie_to.title}
    
    
class Products(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(), nullable=False)

    def __repr__(self):
        return f'<Product: {self.name}'
    
    def serialize(self):
        return{ 'id': self.id,
                'name': self.name,
                'base_price': self.base_price,
                'description': self.description}


class Cart(db.Model):
    __tablename__ = 'carts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    user_to = db.relationship('Users', foreign_keys=[user_id], backref=db.backref('cart', lazy='select'))
    items = db.relationship('CartItem', backref='cart', lazy='select')
    created_at = db.Column(db.DateTime, default=datetime.utcnow())

    def __repr__(self):
        return f'<Cart: Cart user{self.user_to.username}'


class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    quantity = db.Column(db.Integer, nullable=False, default=1)
    product_to_cart = db.relationship('Products', foreign_keys=[product_id], backref=db.backref("cart_items", lazy="select"))
    booking_to_cart = db.relationship('Bookings', foreign_keys=[booking_id], backref=db.backref("cart_items", lazy="select"))

    def __repr__(self):
        return f'<Cart Item: {self.id}'
    
    def serialize(self):
        if self.product_id:
            return {
                "type": "Product",
                "product_id": self.product_id,
                "name": self.product_to_cart.name,
                "quantity": self.quantity,
                "unit_price": self.product_to_cart.base_price,
                "subtotal": self.quantity * self.product_to_cart.base_price
            }
        elif self.booking_id:
            return {
                "type": "Booking",
                "booking_id": self.booking_id,
                "booking_price": self.booking_to_cart.booking_price,
                "movie_title": self.booking_to_cart.showtime_to.movie_to.title,
                "movie_image": self.booking_to_cart.showtime_to.movie_to.backdrop_path,
                "showtime_date":self.booking_to_cart.showtime_to.date_time.strftime("%d/%m/%Y"),
                "showtime_hour":self.booking_to_cart.showtime_to.date_time.strftime("%H:%M"),
                "cinema_room_name": self.booking_to_cart.showtime_to.cinema_room_to.name,
                "col_reserved": self.booking_to_cart.col,
                "row_reserved": self.booking_to_cart.row,
                "subtotal": self.booking_to_cart.booking_price
            }