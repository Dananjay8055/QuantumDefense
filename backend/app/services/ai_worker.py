import time
from threading import Thread
from queue import Empty

from app.modules.network.queue import packet_queue
from app.services.ai_service import AIService
from app.services.event_bus import event_bus


class AIWorker:

    def __init__(self, model_path):

        self.service = AIService(model_path)

        self.running = False
        self.thread = None

    def _run(self):

        while self.running:

            # ====================================================
            # PROCESS INCOMING NETWORK PACKETS
            # ====================================================

            try:

                packet = packet_queue.get(timeout=1)

                try:

                    self.service.analyze(packet)

                finally:

                    packet_queue.task_done()

            except Empty:

                # No packet arrived during the timeout.
                # This is normal and should not be treated as an error.
                pass

            except Exception as e:

                print(
                    "AI Worker error:",
                    repr(e)
                )

            # ====================================================
            # PROCESS EXPIRED NETWORK FLOWS
            # ====================================================

            try:

                results = (
                    self.service.process_expired_flows()
                )

                for result in results:

                    event_bus.publish(result)

                    print(
                        "AI:",
                        result
                    )

            except Exception as e:

                print(
                    "AI processing error:",
                    repr(e)
                )

            # Small delay to avoid unnecessary CPU usage.
            time.sleep(0.1)

    def start(self):

        if self.running:
            return

        self.running = True

        self.thread = Thread(
            target=self._run,
            daemon=True
        )

        self.thread.start()

    def stop(self):

        self.running = False