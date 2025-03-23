from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'))
    col = db.Column(db.Integer)
    row = db.Column(db.Integer)

    def __repr__(self):
        return f'<Booking: {self.id}> - user: {self.user_id}'
    
    def user_bookings(self):
        return {
            "booking_date": self.booking_date.strftime("%d/%m/%Y %H:%M"),
            "row": self.row,
            "col": self.col,
            "booking_price": self.booking_price,
            "movie_title": self.showtime_to.movie_to.title,
            "showtime_date":self.showtime_to.date_time.strftime("%d/%m/%Y %H:%M"),
            "cinema_room_name": self.showtime_to.cinema_room_to.name}

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
    date_time = db.Column(db.DateTime)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    movie_to = db.relationship('Movies', foreign_keys=[movie_id], backref=db.backref('showtime_movie'), lazy='select')
    cinema_room_id = db.Column(db.Integer, db.ForeignKey('cinema_rooms.id'), nullable=False)
    cinema_room_to = db.relationship('CinemaRooms', foreign_keys=[cinema_room_id], backref=db.backref('showtime_room'), lazy='select')
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
    runtime = db.Column(db.Integer, nullable=False)
    overview = db.Column(db.String)
    adult = db.Column(db.Boolean)
    backdrop_path = db.Column(db.String)
    popularity = db.Column(db.Float)
    poster_path = db.Column(db.String)
    release_date = db.Column(db.String)

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
                'release_date': self.release_date}

class Sales(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow())
    discount = db.Column(db.Float)
    total = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_to = db.relationship('Users', foreign_keys=[user_id], backref=db.backref('sales'), lazy='select')
    sales_lines_to = db.relationship('SalesLines', backref='sale', lazy="select")
    booking_user_to = db.relationship('Bookings', backref='booking', lazy="select")

    def __repr__(self):
        return f'<Sales: Sale Date{self.sale_date}'
    
    def serialize(self):
        return{ 'sale_date': self.sale_date.strftime("%d/%m/%Y %H:%M"),
                'sales_lines': [sale_line.serialize() for sale_line in self.sales_lines_to],
                'bookings': [booking.user_bookings() for booking in self.booking_user_to],
                'discount': self.discount,
                'total': self.total,
                'user_id': self.user_id,}

class SalesLines(db.Model):
    __tablename__ = "sales_lines"
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer)
    unit_prince = db.Column(db.Float)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    product_to = db.relationship('Products', foreign_keys=[product_id], backref=db.backref('sales_lines'), lazy='select')

    def __repr__(self):
        return f'<Sales Lines: {self.id}'
    
    def serialize(self):
        return{ 'quantity': self.quantity,
                'unit_prince': self.unit_prince,
                'product': self.product_to.name}
    
class Products(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    base_prince = db.Column(db.Float, nullable=False)
    category = db.Column(db.Enum("Bebida", "Comida", "Merch", name = "category"), nullable=False)

    def __repr__(self):
        return f'<Product: {self.name}'
    
    def serialize(self):
        return{ 'id': self.id,
                'name': self.name,
                'base_prince': self.base_prince,
                'category': self.category,}
