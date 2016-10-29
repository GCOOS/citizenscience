# -*- coding: utf-8 -*-

from uuid import uuid4

from flask import Blueprint, render_template, current_app, request, flash, \
    url_for, redirect, session, abort
from flask_login import login_required, login_user, current_user, logout_user, \
    confirm_login, login_fresh

from citizenscience.user import User
from citizenscience.extensions import db, login_manager
from forms import SignupForm, LoginForm, RecoverPasswordForm, ReauthForm, \
    ChangePasswordForm


from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'citizenscience'

COLLECTION_GBF = 'gbf'
GBF_FIELDS = {'_id': 0,
'Group_ID': 1, 'Monitor_ID': 1, 'Site_ID':1, 'Site_Description':1,
'Latitude':1, 'Longitude':1, 'Sample_Date':1, 'Sample_Time':1, 'Sample_Depth_m': 1,
'Air_Temp_degC': 1, 'Water_Temp_degC': 1, 'Avg_DO': 1, 'pH': 1, 'Transparency_m': 1,
'Total_Depth_m': 1, 'Flow': 1, 'Algae': 1, 'Color': 1, 'Clarity': 1, 'Surface': 1,
'Conditions': 1, 'Odor': 1, 'Weather': 1, 'Days_Since_Precip': 1, 'Rain_Accum': 1,
'Expired_Reagent': 1, 'Enterococcus': 1, 'Specific_Gravity': 1, 'SpGr_Temp': 1,
'Salinity': 1, 'Tide': 1, 'Comments': 1, 'Area': 1, 'Correct_Time': 1, 'Date_Time': 1}

COLLECTION_NACD = 'nacd'
NACD_FIELDS = {'_id': 0,
'No': 1, 'Site_ID':1, 'Site': 1, 'Latitude':1, 'Longitude':1, 'Sample_Date':1,
'Sample_Time':1, 'Monitor_ID': 1, 'Participants': 1, 'Land_Use': 1, 'AirTemp_C': 1,
'Wind_Speed_mph': 1, 'Wind_Direction': 1,  'Tide_stage': 1, 'Weather': 1,
'WaterTemp_C': 1, 'Salinity_ppt': 1, 'Turbidity_NTU': 1, 'pH': 1, 'DissolvedOxygen_ppm': 1,
'Nitrates_ppm': 1, 'Litter_kg': 1, 'Most_Abundant_Litter': 1, 'Most_Abundant_Species': 1,
'Species_Found': 1, 'Date_Time': 1}


def get_db():
    c = MongoClient()
    return c.citizenscience

frontend = Blueprint('frontend', __name__)

@frontend.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('user.profile'))
    return render_template('index.html')


@frontend.route('/citizenscience2')
def index_alt():
    if current_user.is_authenticated:
        return redirect(url_for('user.profile'))
    return render_template('index.html')


@frontend.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('user.profile'))

    form = LoginForm(login=request.args.get('login', None),
                     next=request.args.get('next', None))

    if form.validate_on_submit():
        user, authenticated = User.authenticate(form.login.data,
                                    form.password.data)

        if user and authenticated:
            remember = request.form.get('remember') == 'y'
            if login_user(user, remember=remember):
                flash("Logged in", 'success')
            return redirect(form.next.data or url_for('user.profile'))
        else:
            flash('Sorry, invalid login', 'danger')

    return render_template('frontend/login.html', form=form)


@frontend.route('/reauth', methods=['GET', 'POST'])
@login_required
def reauth():
    form = ReauthForm(next=request.args.get('next'))

    if request.method == 'POST':
        user, authenticated = User.authenticate(current_user.name,
                                    form.password.data)
        if user and authenticated:
            confirm_login()
            flash('Reauthenticated.', 'success')
            return redirect('/change_password')

        flash('Password is wrong.', 'danger')
    return render_template('frontend/reauth.html', form=form)


@frontend.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out', 'success')
    return redirect(url_for('frontend.index'))


@frontend.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('user.profile'))

    form = SignupForm(next=request.args.get('next'))

    if form.validate_on_submit():
        user = User()
        form.populate_obj(user)

        db.session.add(user)
        db.session.commit()

        if login_user(user):
            flash('Signed up', 'success')
            return redirect(form.next.data or url_for('user.profile'))

    return render_template('frontend/signup.html', form=form)


@frontend.route('/change_password', methods=['GET', 'POST'])
def change_password():
    user = None
    if current_user.is_authenticated:
        if not login_fresh():
            return login_manager.needs_refresh()
        user = current_user
    elif 'activation_key' in request.values and 'email' in request.values:
        activation_key = request.values['activation_key']
        email = request.values['email']
        user = User.query.filter_by(activation_key=activation_key) \
                         .filter_by(email=email).first()

    if user is None:
        abort(403)

    form = ChangePasswordForm(activation_key=user.activation_key)

    if form.validate_on_submit():
        user.password = form.password.data
        user.activation_key = None
        db.session.add(user)
        db.session.commit()

        flash("Your password has been changed, please log in again", "success")
        return redirect(url_for("frontend.login"))

    return render_template("frontend/change_password.html", form=form)


@frontend.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    form = RecoverPasswordForm()

    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()

        if user:
            flash('Please see your email for instructions on '
                  'how to access your account', 'success')

            user.activation_key = str(uuid4())
            db.session.add(user)
            db.session.commit()

            return render_template('frontend/reset_password.html', form=form)
        else:
            flash('Sorry, no user found for that email address', 'error')

    return render_template('frontend/reset_password.html', form=form)

# Error handler
@frontend.errorhandler(404)
def handle_404(err):
    return render_template('errors/404.html'), 404


@frontend.errorhandler(500)
def handle_500(err):
    return render_template('errors/500.html'), 500


@frontend.route('/gbf_db')
def gbf_db():
    return render_template('projects/gbf_dashboard.html')


@frontend.route('/gbf_db/data')
def gbf_data():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_GBF]
    #projects = collection.find(fields=FIELDS, limit=50000)
    projects = collection.find({}, GBF_FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)

    json_projects = json.dumps(json_projects)
    geojson_projects = write_to_geojson(json_projects)
    return geojson_projects


@frontend.route('/nacd_db')
def nacd_db():
    return render_template('projects/nacd_dashboard.html')


@frontend.route('/nacd_db/data')
def nacd_data():
    db = get_db()
    projects = db.nacd.find()
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    geojson_projects = write_to_geojson(json_projects)
    return geojson_projects


def write_to_geojson(items):
    return json.dumps({
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature",
            "geometry": {
                "type": 'Point',
                "coordinates": [feature['Longitude'], feature['Latitude']]},
                "properties": {key: value
                    for key, value in feature.items()
                    #if key not in ('Latitude', 'Longitude')
                }
            }
        for feature in json.loads(items)
        ]
    })
