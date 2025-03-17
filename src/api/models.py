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