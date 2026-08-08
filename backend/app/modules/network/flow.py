from collections import defaultdict


class FlowAggregator:

    def __init__(self):
        self.flows = {}

    def _create_flow(self, packet):
        return {
            "start_time": packet.timestamp,
            "last_time": packet.timestamp,

            "fwd_packets": 0,
            "bwd_packets": 0,

            "fwd_bytes": 0,
            "bwd_bytes": 0,

            "fwd_lengths": [],
            "bwd_lengths": [],
            "packet_lengths": [],

            "fwd_times": [],
            "bwd_times": [],

            "fwd_header_lengths": [],
            "bwd_header_lengths": [],

            "syn_count": 0,
            "fin_count": 0,
            "rst_count": 0,
            "psh_count": 0,
            "ack_count": 0,
            "urg_count": 0,

            "fwd_windows": [],
            "bwd_windows": [],
            "packet_times": [],
        }

    def add_packet(self, packet):

        key = (
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

        if key in self.flows:
            flow = self.flows[key]
            direction = "fwd"

        elif reverse_key in self.flows:
            flow = self.flows[reverse_key]
            direction = "bwd"

        else:
            self.flows[key] = self._create_flow(packet)
            flow = self.flows[key]
            direction = "fwd"

        flow["last_time"] = packet.timestamp
        flow["packet_times"].append(packet.timestamp)
        flow["packet_lengths"].append(packet.length)

        # TCP flags
        flags = packet.tcp_flags

        if flags & 0x02:
            flow["syn_count"] += 1

        if flags & 0x01:
            flow["fin_count"] += 1

        if flags & 0x04:
            flow["rst_count"] += 1

        if flags & 0x08:
            flow["psh_count"] += 1

        if flags & 0x10:
            flow["ack_count"] += 1

        if flags & 0x20:
            flow["urg_count"] += 1

        if direction == "fwd":

            flow["fwd_packets"] += 1
            flow["fwd_bytes"] += packet.length

            flow["fwd_lengths"].append(packet.length)
            flow["fwd_times"].append(packet.timestamp)

            flow["fwd_header_lengths"].append(
                packet.ip_header_length +
                packet.transport_header_length
            )

            flow["fwd_windows"].append(
                packet.tcp_window
            )

        else:

            flow["bwd_packets"] += 1
            flow["bwd_bytes"] += packet.length

            flow["bwd_lengths"].append(packet.length)
            flow["bwd_times"].append(packet.timestamp)

            flow["bwd_header_lengths"].append(
                packet.ip_header_length +
                packet.transport_header_length
            )

            flow["bwd_windows"].append(
                packet.tcp_window
            )

        return flow