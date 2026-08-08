from datetime import datetime

from app.core.extensions import db


class ThreatLog(db.Model):

    __tablename__ = "threat_logs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    timestamp = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    source_ip = db.Column(
        db.String(50)
    )

    destination_ip = db.Column(
        db.String(50)
    )

    protocol = db.Column(
        db.String(20)
    )

    attack_type = db.Column(
        db.String(100)
    )

    confidence = db.Column(
        db.Float
    )

    action = db.Column(
        db.String(50)
    )