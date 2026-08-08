from app.modules.network.queue import packet_queue


class NetworkService:

    @staticmethod
    def queue_size():
        return packet_queue.qsize()