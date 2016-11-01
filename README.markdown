# Citizen Science Water Quality Monitoring Viewer

## INTRODUCTION

This is Citizen Science based water quality monitoring network program for the Gulf of Mexico. Gulf of Mexico Coastal Ocean Observing System Regional Association (GCOOS-RA) offers a viewer.

http://gulfcitizenscience.org


### Frontend

 - [jQuery](http://jquery.com/)
 - [Twitter Bootstrap](https://github.com/twitter/bootstrap)
 - [Leaflet](http://leafletjs.com)
 - [esri-leaflet](https://esri.github.io/esri-leaflet/)
 - [list.js](http://listjs.com)
 - [typeahead.js](https://twitter.github.io/typeahead.js/)
 - [highcharts](http://www.highcharts.com)
 - [datatables](https://datatables.net/)


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
 - Apache + mod\_wsgi
 - MongoDB
 - node.js
 - bower


Setup

   1. >> virtualenv csenv
   2. >> source csenv/bin/activate
   3. >> git clone https://github.com/GCOOS/citizenscience.git citizenscience
   4. >> cd citizenscience
   5. >> pip install -r requirements.txt
   6. >> cd citizenscience/static
   7. >> npm install
   8. >> bower install
   9. >> mongoimport -d citizenscience -c gbf --type csv --file data/gbf_test_data.csv --headerline
   10. >> mongoimport -d citizenscience -c nacd --type csv --file data/nacd_test_data.csv --headerline
   11. >> cd ../../
   12. >> fab debug
   13. Open http://127.0.0.1:5000

vhost

    WSGIDaemonProcess citizenscience python-path=/var/www/wsgi/projects/cs2env/lib/python2.7/site-packages user=apache group=apache threads=15
    WSGIScriptAlias /citizenscience /var/www/wsgi/projects/citizenscience/wsgi.py
    <Directory /var/www/wsgi/projects/citizenscience/>
        WSGIScriptReloading On
        WSGIProcessGroup citizenscience
        WSGIApplicationGroup %{GLOBAL}
        #Order deny,allow
        #Allow from all
        Require all granted
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
        │   ├── bower.json  
        │   ├── css
        │   ├── favicon.png
        │   ├── humans.txt
        │   ├── images
        │   ├── js
                ├── proj             ** customize this folder's files
                    ├── boot_map.js
                    ├── boot_gbf.js
                    ├── boot_nacd.js
                    ├── boot_index.js
                    ├── gbf_dashboard.js
                    ├── nacd_dashboard.js
                ├── plugins.js
                └── main.js
        │   ├── node_modules  
        │   ├── package.json           
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
            ├── projects             This project's files
                ├── gbf_dashboard.html   ** customize this file
                ├── nacd_dashboard.html  ** customize this file
            └── user


[MIT LICENSE](http://www.tldrlegal.com/license/mit-license)

## ACKNOWLEDGEMENTS

This is built based on Fbone (Flask bone)
Thanks to Python, Flask, its [extensions](http://flask.pocoo.org/extensions/), Fbone and other goodies.
