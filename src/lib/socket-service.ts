/**
 * WebSockets Simulation Service (Section 8.2 replacement)
 * Replaces polling with event-driven streams for real-time dashboard updates.
 */

type SocketEvent = 'METRIC_UPDATE' | 'VCS_EVENT' | 'SECURITY_ALERT';

type Listener = (data: any) => void;

class SocketService {
    private listeners: Record<string, Listener[]> = {};

    /**
     * Connect to the real-time stream
     */
    connect() {
        console.log("[SocketService] Connected to real-time metric stream.");
        // In a real app, this would be: this.socket = io(SERVER_URL);
    }

    /**
     * Listen for specific events
     */
    on(event: SocketEvent, callback: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Stop listening for specific events
     */
    off(event: SocketEvent, callback: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    }

    /**
     * Broadcast an event (Used by backend/webhooks)
     */
    broadcast(event: SocketEvent, data: any) {
        console.log(`[SocketService] Broadcasting ${event}:`, data);
        if (this.listeners[event]) {
            // Simulate staggered network latency for "Live Nerve Center" feel
            setTimeout(() => {
                this.listeners[event].forEach(callback => callback(data));
            }, Math.random() * 500 + 200);
        }
    }

    /**
     * Simulate a live commit stream for demonstration
     */
    simulateLiveStream() {
        setInterval(() => {
            const randomMetric = {
                timestamp: new Date().toISOString(),
                type: Math.random() > 0.5 ? 'AI' : 'Manual',
                loc: Math.floor(Math.random() * 200) + 10,
                confidence: Math.random(),
            };
            this.broadcast('METRIC_UPDATE', randomMetric);
        }, 15000); // Every 15 seconds
    }
}

export const socketService = new SocketService();
