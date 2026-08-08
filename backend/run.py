from app import create_app
from app.core.extensions import socketio
from app.services.ai_worker import AIWorker


app = create_app()

ai_worker = AIWorker(
    "../models/random_forest.joblib"
)

ai_worker.start()


if __name__ == "__main__":
    socketio.run(
        app,
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False
    )