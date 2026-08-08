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

    if TCP in packet:
        protocol = "TCP"
        src_port = packet[TCP].sport
        dst_port = packet[TCP].dport

    elif UDP in packet:
        protocol = "UDP"
        src_port = packet[UDP].sport
        dst_port = packet[UDP].dport

    info = PacketInfo(
        timestamp=time(),
        src_ip=packet[IP].src,
        dst_ip=packet[IP].dst,
        src_port=src_port,
        dst_port=dst_port,
        protocol=protocol,
        length=len(packet)
    )

    if not packet_queue.full():
        packet_queue.put(info)


def start_capture():

    sniff(
        prn=process_packet,
        store=False
    )