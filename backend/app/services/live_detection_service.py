import time

from app.modules.ai.live_detector import LiveDetector
from app.modules.network.flow import FlowAggregator


class LiveDetectionService:

    FLOW_TIMEOUT = 5.0

    def __init__(self, model_path):
        self.detector = LiveDetector(model_path)
        self.flows = FlowAggregator()
        self.last_seen = {}

    def process_packet(self, packet):

        flow_key = (
            packet.src_ip,
            packet.dst_ip,
            packet.src_port,
            packet.dst_port,
            packet.protocol,
        )

        reverse_key = (
            packet.dst_ip,
            packet.src_ip,
            packet.dst_port,
            packet.src_port,
            packet.protocol,
        )

        if reverse_key in self.last_seen:
            flow_key = reverse_key

        self.flows.add_packet(packet)

        self.last_seen[flow_key] = time.time()

        return None

    def process_expired_flows(self):

        now = time.time()
        results = []

        for flow_key, last_time in list(self.last_seen.items()):

            if now - last_time < self.FLOW_TIMEOUT:
                continue

            flow = self.flows.flows.get(flow_key)

            if flow is None:
                continue

            destination_port = flow_key[3]

            # Run AI detection
            detection_result = self.detector.predict(
                flow,
                destination_port
            )

            # Build complete event
            event = {
                "flow": flow_key,
                "result": detection_result
            }

            results.append(event)

            # Remove completed flow
            del self.last_seen[flow_key]
            del self.flows.flows[flow_key]

        return results