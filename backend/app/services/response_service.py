class ResponseService:

    ACTION_MESSAGES = {
        "MONITOR": {
            "status": "SIMULATED",
            "message": "Suspicious activity is being monitored."
        },

        "RATE_LIMIT": {
            "status": "SIMULATED",
            "message": "Traffic from the suspicious source is being rate-limited."
        },

        "BLOCK_SOURCE": {
            "status": "SIMULATED",
            "message": "Traffic from the suspicious source is being blocked."
        },

        "ISOLATE_HOST": {
            "status": "SIMULATED",
            "message": "The affected host is being isolated from the network."
        }
    }

    def execute(self, action, source=None, destination=None):

        action = str(action).upper()

        if action not in self.ACTION_MESSAGES:
            raise ValueError(
                "Invalid response action. "
                "Use MONITOR, RATE_LIMIT, BLOCK_SOURCE, or ISOLATE_HOST."
            )

        result = self.ACTION_MESSAGES[action].copy()

        result["action"] = action
        result["source"] = source
        result["destination"] = destination

        return result


response_service = ResponseService()
