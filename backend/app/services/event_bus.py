class EventBus:

    def __init__(self):
        self.events = []

    def publish(self, event):
        self.events.append(event)

        if len(self.events) > 1000:
            self.events = self.events[-1000:]

    def get_events(self, limit=100):
        return self.events[-limit:]


event_bus = EventBus()