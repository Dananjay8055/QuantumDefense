from dataclasses import dataclass


@dataclass(slots=True)
class PacketInfo:
    timestamp: float
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    length: int

    # TCP information
    tcp_flags: int = 0
    tcp_window: int = 0

    # Header information
    ip_header_length: int = 0
    transport_header_length: int = 0