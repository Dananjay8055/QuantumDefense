from time import time

from scapy.all import sniff
from scapy.layers.inet import IP, TCP, UDP

from .models import PacketInfo
from .queue import packet_queue


def process_packet(packet):

    if IP not in packet:
        return

    protocol = "OTHER"
    src_port = 0
    dst_port = 0
    tcp_flags = 0
    tcp_window = 0
    transport_header_length = 0

    if TCP in packet:
        protocol = "TCP"
        src_port = packet[TCP].sport
        dst_port = packet[TCP].dport
        tcp_flags = int(packet[TCP].flags)
        tcp_window = packet[TCP].window
        transport_header_length = packet[TCP].dataofs * 4

    elif UDP in packet:
        protocol = "UDP"
        src_port = packet[UDP].sport
        dst_port = packet[UDP].dport
        transport_header_length = 8

    info = PacketInfo(
        timestamp=time(),
        src_ip=packet[IP].src,
        dst_ip=packet[IP].dst,
        src_port=src_port,
        dst_port=dst_port,
        protocol=protocol,
        length=len(packet),
        tcp_flags=tcp_flags,
        tcp_window=tcp_window,
        ip_header_length=packet[IP].ihl * 4,
        transport_header_length=transport_header_length,
    )

    if not packet_queue.full():
        packet_queue.put(info)


def start_capture():

    sniff(
        prn=process_packet,
        store=False
    )