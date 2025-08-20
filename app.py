from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Location
from config import Config
from forms import LocationForm
from datetime import datetime
from pathlib import Path
import json

# Створюємо Flask додаток
app = Flask(__name__)
app.config.from_object(Config)

# Ініціалізуємо базу даних
db.init_app(app)

# Налаштовуємо систему входу
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Куди перенаправляти неавторизованих
login_manager.login_message = 'Будь ласка, увійдіть для доступу до цієї сторінки.'


@login_manager.user_loader
def load_user(user_id):
    """Завантажує користувача за ID"""
    return db.session.get(User, int(user_id))  # Новий синтаксис SQLAlchemy

# Головна сторінка


@app.route('/')
def index():
    problem_type = request.args.get('problem_type', 'all')
    status = request.args.get('status', 'all')

    query = Location.query

    if problem_type != 'all':
        query = query.filter(Location.problem_type == problem_type)

    if status != 'all':
        query = query.filter(Location.status == status)

    # Отримуємо всі записи
    locations = query.all()

    # Форматуємо адреси
    for location in locations:
        location.formatted_address = format_address(location.address)

    # Сортуємо по відформатованій адресі
    locations.sort(key=lambda x: x.formatted_address)

    # Оновлюємо оригінальні адреси для відображення
    for location in locations:
        location.address = location.formatted_address

    # Статистика для поточного фільтру
    total_count = len(locations)
    completed_count = len([l for l in locations if l.status == 'completed'])
    in_progress_count = len(
        [l for l in locations if l.status == 'in_progress'])

    return render_template('index.html',
                           locations=locations,
                           current_problem_type=problem_type,
                           current_status=status,
                           total_count=total_count,
                           completed_count=completed_count,
                           in_progress_count=in_progress_count)


# Сторінка входу
@app.route('/login', methods=['GET', 'POST'])
def login():
    """Вхід користувача"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        print(f"Спроба входу: {username}")  # Відладка

        user = User.query.filter_by(username=username).first()

        if user:
            print(f"Користувач знайдений: {user.username}")  # Відладка
            if user.check_password(password):
                login_user(user, remember=True)
                flash('Ви успішно увійшли!', 'success')
                return redirect(url_for('index'))
            else:
                print("Неправильний пароль")  # Відладка
                flash('Неправильний пароль', 'error')
        else:
            print("Користувач не знайдений")  # Відладка
            flash('Користувач не знайдений', 'error')

    return render_template('login.html')

# Вихід


@app.route('/logout')
@login_required
def logout():
    """Вихід користувача"""
    logout_user()
    flash('Ви вийшли з системи', 'info')
    return redirect(url_for('index'))

# Створення бази даних та тестових даних
# Додавання нової дислокації


@app.route('/add', methods=['GET', 'POST'])
@login_required
def add_location():
    """Додавання нової дислокації (тільки для адмінів)"""
    if not current_user.is_admin():
        flash('Доступ заборонено. Тільки адміни можуть додавати дислокації.', 'error')
        return redirect(url_for('index'))

    form = LocationForm()

    if form.validate_on_submit():
        # Перевіряємо, чи вибрані координати
        if not form.latitude.data or not form.longitude.data:
            flash('Будь ласка, виберіть місце на карті', 'error')
            return render_template('add_location.html', form=form)

        location = Location(
            address=form.address.data,
            latitude=form.latitude.data,
            longitude=form.longitude.data,
            problem_type=form.problem_type.data,
            description=form.description.data,
            created_by=current_user.id
        )

        db.session.add(location)
        db.session.commit()

        flash(f'Дислокацію "{location.address}" успішно додано!', 'success')
        return redirect(url_for('index'))

    return render_template('add_location.html', form=form)


@app.route('/map')
def map_all():
    problem_type = request.args.get('problem_type', 'all')

    # Показуємо тільки завдання в роботі
    query = Location.query.filter(Location.status == 'in_progress')

    if problem_type != 'all':
        query = query.filter(Location.problem_type == problem_type)

    locations = query.all()

    # Форматуємо адреси
    for location in locations:
        location.formatted_address = format_address(location.address)

    # Сортуємо по відформатованій адресі
    locations.sort(key=lambda x: x.formatted_address)

    # Оновлюємо оригінальні адреси для відображення
    for location in locations:
        location.address = location.formatted_address

    # Статистика тільки для завдань в роботі
    total_count = len(locations)
    branches_count = len([l for l in locations if l.problem_type == 'Гілля'])
    leaves_count = len([l for l in locations if l.problem_type == 'Листя'])
    trash_count = len([l for l in locations if l.problem_type == 'Звалища'])

    return render_template('map_all.html',
                           locations=locations,
                           current_problem_type=problem_type,
                           total_count=total_count,
                           branches_count=branches_count,
                           leaves_count=leaves_count,
                           trash_count=trash_count)

# Редагування дислокації


@app.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_location(id):
    """Редагування дислокації (тільки для адмінів)"""
    if not current_user.is_admin():
        flash('Доступ заборонено.', 'error')
        return redirect(url_for('index'))

    location = Location.query.get_or_404(id)
    form = LocationForm(obj=location)

    if form.validate_on_submit():
        location.address = form.address.data
        location.latitude = form.latitude.data
        location.longitude = form.longitude.data
        location.problem_type = form.problem_type.data
        location.description = form.description.data

        db.session.commit()
        flash(f'Дислокацію "{location.address}" оновлено!', 'success')
        return redirect(url_for('index'))

    return render_template('add_location.html', form=form, location=location)

# Зміна статусу дислокації


@app.route('/status/<int:id>/<status>')
@login_required
def change_status(id, status):
    """Зміна статусу дислокації"""
    if not current_user.is_admin():
        flash('Доступ заборонено.', 'error')
        return redirect(url_for('index'))

    location = Location.query.get_or_404(id)
    location.status = status

    if status == 'completed':
        location.date_completed = datetime.utcnow() #TODO

    db.session.commit()
    flash(f'Статус дислокації змінено на "{status}"', 'success')
    return redirect(url_for('index'))


def create_admin_user():
    """Створює адміна, якщо його немає"""
    admin = User.query.filter_by(username='xvkg').first()
    if not admin:
        admin = User(username='xvkg', role='admin')
        admin.set_password('4upakabra07')
        db.session.add(admin)
        db.session.commit()
        print("✅ Створено адміна: admin / 4upakabra07")
    else:
        print("✅ Адмін вже існує")

    # Перевіримо, чи правильно зберігся пароль
    # test_admin = User.query.filter_by(username='admin').first()
    # if test_admin and test_admin.check_password('4upakabra07'):
    #     print("✅ Пароль адміна працює")
    # else:
    #     print("❌ Проблема з паролем адміна")


# Видалення дислокації
@app.route('/delete/<int:id>')
@login_required
def delete_location(id):
    """Видалення дислокації (тільки для адмінів)"""
    if not current_user.is_admin():
        flash('Доступ заборонено.', 'error')
        return redirect(url_for('index'))

    location = Location.query.get_or_404(id)
    address = location.address  # Зберігаємо адресу для повідомлення

    db.session.delete(location)
    db.session.commit()

    flash(f'Дислокацію "{address}" успішно видалено!', 'success')
    return redirect(url_for('index'))


@app.route('/export')
def export_excel():
    """Експорт дислокацій в XLSX з поточними фільтрами (без запису на диск)"""

    import pandas as pd
    from datetime import datetime
    import io
    from flask import send_file

    # Отримуємо ті ж фільтри, що і на головній сторінці
    problem_type = request.args.get('problem_type', 'all')
    status = request.args.get('status', 'all')

    # Базовий запит
    query = Location.query

    # Застосовуємо фільтри
    if problem_type != 'all':
        query = query.filter(Location.problem_type == problem_type)

    if status != 'all':
        query = query.filter(Location.status == status)

    locations = query.order_by(Location.date_created.desc()).all()

    # Підготовка даних для Excel
    data = []
    for loc in locations:
        status_text = {
            'pending': 'Очікує',
            'in_progress': 'В роботі',
            'completed': 'Виконано'
        }.get(loc.status, loc.status)

        data.append({
            'ID': loc.id,
            'Адреса': loc.address,
            'Тип проблеми': loc.problem_type,
            'Статус': status_text,
            'Опис': loc.description or '',
            'Широта': loc.latitude,
            'Довгота': loc.longitude,
            'Дата створення': loc.date_created.strftime('%d.%m.%Y %H:%M'),
            'Дата виконання': loc.date_completed.strftime('%d.%m.%Y %H:%M') if loc.date_completed else ''
        })

    # Якщо немає записів, можна повернути порожній файл
    df = pd.DataFrame(data)

    # Генеруємо назву файлу з фільтрами
    filename_parts = ['locations']
    if problem_type != 'all':
        filename_parts.append(problem_type.lower())
    if status != 'all':
        filename_parts.append(status)
    filename_parts.append(datetime.now().strftime('%Y%m%d_%H%M'))

    filename = '_'.join(filename_parts) + '.xlsx'

    # Створюємо Excel у пам'яті
    output = io.BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)

    # Віддаємо файл напряму
    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )


@app.route('/location/<int:location_id>/map')
def location_map(location_id):
    location = Location.query.get_or_404(location_id)
    return render_template('location_map.html', location=location)

# Функція для форматування адреси


def format_address(address):
    # абсолютний шлях до файлу, незалежно від робочої директорії
    file_path = Path(__file__).parent / "static" / "street-names.json"
    with open(file_path, "r", encoding="utf-8") as f:
        addresses = json.load(f)
        for k, v in addresses.items():
            if address.startswith(k):
                return address.replace(k, v)
    return address


if __name__ == '__main__':
    # Створюємо таблиці та адміна при запуску
    with app.app_context():
        db.create_all()
        create_admin_user()

    app.run(debug=True)
