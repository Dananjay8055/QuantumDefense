from flask import Flask

from app.api import api

from threading import Thread
from app import database
from app.modules.network.capture import start_capture

from app.core.config import Config
from app.core.extensions import cors,socketio,db

from app.core.logger import configure_logger


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        # import app.database
        db.create_all()
    configure_logger()

    cors.init_app(app)

    socketio.init_app(app)

    app.register_blueprint(api)

    Thread(
        target=start_capture,
        daemon=True
    ).start()
    
    return app