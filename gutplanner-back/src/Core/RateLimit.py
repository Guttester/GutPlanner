from threading import Lock
from time import monotonic
from fastapi import HTTPException


class RateLimit:
    """Janela fixa por processo. Em múltiplos workers, usar armazenamento compartilhado."""
    def __init__(self, limit: int = 120, window: int = 60):
        if limit < 1 or window < 1:
            raise ValueError("Limites devem ser positivos.")
        self.limit = limit
        self.window = window
        self.entries = {}
        self.lock = Lock()

    def check(self, key: str) -> None:
        now = monotonic()
        with self.lock:
            self.entries = {key: value for key, value in self.entries.items() if value[0] > now}
            expires, count = self.entries.get(key, (now + self.window, 0))
            if count >= self.limit or (key not in self.entries and len(self.entries) >= 10000):
                raise HTTPException(429, headers={"Retry-After": str(max(1, int(expires - now) + 1))})
            self.entries[key] = (expires, count + 1)
