# Citizen Science Water Quality Monitoring Viewer

## INTRODUCTION

This is Citizen Science based water quality monitoring network program for the Gulf of Mexico. Gulf of Mexico Coastal Ocean Observing System Regional Association (GCOOS-RA) offers a viewer which is built based on Fbone (Flask bone).

http://gulfcitizenscience.org


## FEATURES

## COMPONENTS

### Frontend

 - [HTML5 Boilerplate](https://github.com/h5bp/html5-boilerplate)
 - [jQuery](http://jquery.com/)
 - [Twitter Bootstrap](https://github.com/twitter/bootstrap)
 - [Jinja2](http://jinja.pocoo.org/docs/dev/)

### Flask Extensions

 - [SQLAlchemy](http://www.sqlalchemy.org) and [Flask-SQLAlchemy](http://flask-sqlalchemy.pocoo.    org)
 - [WTForms](http://wtforms.readthedocs.io) and [Flask-WTF](https://flask-wtf.readthedocs.io).
 - [Flask-Login](https://flask-login.readthedocs.io)
 - [Flask-Testing](https://pythonhosted.org/Flask-Testing/)
 - [Flask-RESTful](http://flask-restful-cn.readthedocs.io/)


## USAGE

 Pre-required Setup:

 - git
 - Python / pip / Fabric
 - sqlite / MySQL
 - Apache + mod\_wsgi
 - MongoDB
 - oauth2client
 - requests

Test     

   fab bootstrap
   fab test
   fab debug

Clone

    cd /var/www
    git clone https://github.com/otwn/Citizen-Science-Water-Quality-Viewer.git citizenscience

vhost

    WSGIDaemonProcess citizenscience user=apache group=apache threads=5
    WSGIScriptAlias /citizenscience /var/www/wsgi/citizenscience/app.wsgi

    <Directory /var/www/wsgi/citizenscience/>
        WSGIScriptReloading On
        WSGIProcessGroup citizenscience
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>



## STRUCTURE

     ├── CHANGES                     Change logs
     ├── README.markdown
     ├── fabfile.py                  Fabric file to automated managament project
     ├── fbone.conf                  Apache config
     ├── requirements.txt            3rd libraries
     ├── tests.py                    Unittests
     ├── wsgi.py                     Wsgi app
     ├── citizenscience
        ├── __init__.py
        ├── app.py                   Main App
        ├── config.py                Develop / Testing configs
        ├── constants.py             Constants
        ├── decorators.py            Customized decorators
        ├── extensions.py            Flask extensions
        ├── filters.py               Flask filters
        ├── utils.py                 Python utils
        ├── frontend                 Frontend blueprint
        │   ├── __init__.py
        │   ├── forms.py             Forms used in frontend modular
        │   ├── views.py             Views used in frontend modular
        ├── user
        ├── api
        ├── static                   Static files
        │   ├── bower_components     Javascript/css libraries
        │   ├── css
        │   ├── favicon.png
        │   ├── humans.txt
        │   ├── images
        │   ├── js
        │   ├── bower.json           
        │   └── robots.txt
        └── templates                Jinja2 templates
            ├── errors
            ├── frontend
            ├── index.html
            ├── layouts              Jinja2 layouts
            │   ├── base.html
            │   └── user.html
            ├── macros               Jinja2 macros
            ├── mails                Mail templates
            └── user


[MIT LICENSE](http://www.tldrlegal.com/license/mit-license)

## ACKNOWLEDGEMENTS

Thanks to Python, Flask, its [extensions](http://flask.pocoo.org/extensions/), Fbone and other goodies.
