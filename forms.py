from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, FloatField, SubmitField, HiddenField
from wtforms.validators import DataRequired, NumberRange, Optional


class LocationForm(FlaskForm):
    """Форма для додавання/редагування дислокації"""
    address = StringField('Адреса', validators=[DataRequired()],
                          render_kw={"placeholder": "бул.Будівельників, 19"})

    latitude = FloatField('Широта', validators=[Optional(), NumberRange(min=40, max=60)],
                          render_kw={"placeholder": "Виберіть на карті", "readonly": True})

    longitude = FloatField('Довгота', validators=[Optional(), NumberRange(min=30, max=40)],
                           render_kw={"placeholder": "Виберіть на карті", "readonly": True})

    problem_type = SelectField('Тип проблеми',
                               choices=[('Гілля', 'Гілля'), ('Листя',
                                                             'Листя'), ('Звалища', 'Звалища')],
                               validators=[DataRequired()])

    description = TextAreaField('Опис проблеми',
                                render_kw={"placeholder": "Детальний опис проблеми...", "rows": 3})

    submit = SubmitField('Зберегти дислокацію')
