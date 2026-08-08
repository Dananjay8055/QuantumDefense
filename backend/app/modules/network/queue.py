from queue import Queue
from .models import PacketInfo

packet_queue = Queue(maxsize=5000)