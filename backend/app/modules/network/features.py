from scapy.layers.inet import IP, TCP, UDP

def extract_features(packet):

    data = {}

    if IP in packet:
        data["src_ip"] = packet[IP].src
        data["dst_ip"] = packet[IP].dst
        data["protocol"] = packet[IP].proto
        data["length"] = len(packet)

        if TCP in packet:
            data["src_port"] = packet[TCP].sport
            data["dst_port"] = packet[TCP].dport
            data["transport"] = "TCP"

        elif UDP in packet:
            data["src_port"] = packet[UDP].sport
            data["dst_port"] = packet[UDP].dport
            data["transport"] = "UDP"

        else:
            data["transport"] = "OTHER"

    return data