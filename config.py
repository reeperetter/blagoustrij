import os


class Config:
    # Секретний ключ для форм та сесій
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'

    # Шлях до бази даних SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL') or 'sqlite:///locations.db'

    # Вимкнути відстеження змін (економить пам'ять)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
