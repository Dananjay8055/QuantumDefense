from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

cors = CORS()

socketio = SocketIO(
    cors_allowed_origins="*"
)

db = SQLAlchemy()