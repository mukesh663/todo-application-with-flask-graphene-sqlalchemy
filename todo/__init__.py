from flask import Flask, render_template
from flask_graphql import GraphQLView
from flask_sqlalchemy import SQLAlchemy
import os, stripe
from flask_oidc import OpenIDConnect

db = SQLAlchemy()

stripe_keys = {
  'secret_key': os.environ['SECRET_KEY'],
  'publishable_key': os.environ['PUBLISHABLE_KEY']
}

stripe.api_key = stripe_keys['secret_key']

def create_app():
    app = Flask(__name__)
    app.config.update({
        'SECRET_KEY': '1234',
        'TESTING': True,
        'DEBUG': True,
        'OIDC_CLIENT_SECRETS': 'client_secrets.json',
        'OIDC_ID_TOKEN_COOKIE_SECURE': False,
        'OIDC_REQUIRE_VERIFIED_EMAIL': False,
        'OIDC_USER_INFO_ENABLED': True,
        'OIDC_OPENID_REALM': 'userauth',
        'OIDC_SCOPES': ['openid', 'email', 'profile'],
        'OIDC_INTROSPECTION_AUTH_METHOD': 'client_secret_post',
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{os.getcwd()}/todo.sqlite3",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    })

    oidc = OpenIDConnect(app)
    db.init_app(app)

    from todo.schema import schema

    def GraphQLViewWithAuth(**kwargs):
        return oidc.require_login(GraphQLView.as_view('/graphql', schema=schema, graphiql=True))
    
    app.add_url_rule(
        '/graphql',
        view_func=GraphQLViewWithAuth()
    )

    @app.before_first_request
    def initialize_database():
        db.create_all()

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()

    @app.route('/')
    def landing():
        return render_template('landing.html')

    @app.route('/home')
    @oidc.require_login
    def home():
        return render_template('home.html', key=stripe_keys['publishable_key'])

    @app.route('/checkout', methods=['POST'])
    @oidc.require_login
    def checkout():
        return render_template('checkout.html')

    return app