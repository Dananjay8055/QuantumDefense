from flask import jsonify

from app.services.ai_service import AIService


ai_service = AIService(
    "../models/random_forest.joblib"
)


def predict():
    return jsonify({
        "status": "AI detector ready"
    })