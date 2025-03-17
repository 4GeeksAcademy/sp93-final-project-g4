from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Integer, unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    points = db.Column(db.Integer)
    wallet = db.Column(db.Double)
    is_admin = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

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
    user_id = db.Column(db.Integer)
    showtime_id = db.Column(db.Integer)
    col = db.Column(db.Integer)
    row = db.Column(db.Integer)

    def __repr__(self):
        return f'<Booking: {self.id}> - user: {self.user_id}'

    def serialize(self):
        return {'id': self.id,
                'booking_date': self.booking_date,
                'user_id': self.user_id,
                'showtime_id': self.showtime_id,
                'col': self.col,
                'row': self.row}

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
    __tablename__ = "show_times"
    id = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.Datetime)
    movie_id = db.Column(db.Integer)
    cinema_room_id = db.Column(db.Integer)
    available = db.Column(db.Integer)

    def __repr__(self):
        return f'<Show Time: date time: {self.date_time} - movie : {self.movie_id}'
    
    def serialize(self):
        return{ 'id': self.id,
                'date_time': self.date_time,
                'movie_id': self.movie_id,
                'cinema_room_id': self.cinema_room_id,
                'available': self.available}
    

class Movies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True)
    title = db.Column(db.String, nullable=False)
    duration = db.Column(db.Integer, nullalbe=False)
    overview = db.Column(db.String)
    adult = db.Column(db.Boolean)
    backdrop_path = db.Column(db.String)
    popularity = db.Column(db.Double)
    poster_path = db.Column(db.String)
    release_date = db.Column(db.String)

    def __repr__(self):
        return f'<Movies: title{self.title}'
    
    def serialize(self):
        return{ 'id': self.id,
                'tmdb_id': self.tmdb_id,
                'duration': self.duration,
                'overview': self.overview,
                'adult': self.adult,
                'backdrop_path': self.backdrop_path,
                'popularity': self.popularity,
                'poster_path': self.poster_path,
                'release_date': self.release_date}

class Sales(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow())
    discount = db.Column(db.Double)
    total = db.Column(db.Double)
    user_id = db.Column(db.Integer)

    def __repr__(self):
        return f'<Sales: Sale Date{self.sale_date}'
    
    def serialize(self):
        return{ 'id': self.id,
                'sale_date': self.sale_date,
                'discount': self.discount,
                'total': self.total,
                'user_id': self.user_id,}

class SalesLines(db.Model):
    __tablename__ = "sales_lines"
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer)
    unit_prince = db.Column(db.Double)
    sale_id = db.Column(db.Integer)
    product_id = db.Column(db.Integer)

    def __repr__(self):
        return f'<Sales Lines: {self.id}'
    
    def serialize(self):
        return{ 'id': self.id,
                'quantity': self.quantity,
                'unit_prince': self.unit_prince,
                'sale_id': self.sale_id,
                'product_id': self.product_id,}
    
class Products(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    base_prince = db.Column(db.Double, nullable=False)
    category = db.Column(db.Enum("Bebida", "Comida", "Merch", name = "category"), nullable=False)

    def __repr__(self):
        return f'<Product: {self.name}'
    
    def serialize(self):
        return{ 'id': self.id,
                'name': self.name,
                'base_prince': self.base_prince,
                'category': self.category,}