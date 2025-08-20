from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Створюємо об'єкт бази даних
db = SQLAlchemy()


class User(UserMixin, db.Model):
    """Модель користувача для аутентифікації"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'admin' або 'user'

    def set_password(self, password):
        """Зашифрувати пароль"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Перевірити пароль"""
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        """Перевірити чи користувач адмін"""
        return self.role == 'admin'


class Location(db.Model):
    """Модель дислокації/проблемного місця"""
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    # Гілля, Листя, Звалища
    problem_type = db.Column(db.String(50), nullable=False)
    # Високий, Середній, Низький
    priority = db.Column(db.String(20), default='Середній')
    # in_progress, completed
    status = db.Column(db.String(20), default='in_progress')
    description = db.Column(db.Text)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    date_completed = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    def get_priority_order(self):
        """Повертає числове значення для сортування"""
        priority_map = {'Високий': 1, 'Середній': 2, 'Низький': 3}
        return priority_map.get(self.priority, 2)

    def __repr__(self):
        return f'<Location {self.address}>'
