from app.services.live_detection_service import LiveDetectionService


class AIService:

    def __init__(self, model_path):
        self.detector = LiveDetectionService(model_path)

    def analyze(self, packet):
        return self.detector.process_packet(packet)

    def process_expired_flows(self):
        return self.detector.process_expired_flows()