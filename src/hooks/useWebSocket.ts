import { useEffect, useRef, useState, useCallback } from 'react';
import type { MessagePayload } from '../types';

export function useWebSocket(url?: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<MessagePayload | null>(null);

    const wsUrl = url || (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:8000/api/stream';

    const send = useCallback((msg: MessagePayload) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    useEffect(() => {
        try {
            wsRef.current = new WebSocket(wsUrl);
        } catch (err) {
            console.warn('WebSocket connection failed', err);
            return;
        }

        wsRef.current.onopen = () => setConnected(true);
        wsRef.current.onclose = () => setConnected(false);
        wsRef.current.onmessage = (evt) => {
            try {
                const data = JSON.parse(evt.data) as MessagePayload;
                setLastMessage(data);
            } catch (e) {
                console.warn('Failed to parse WS message', e);
            }
        };

        return () => {
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [wsUrl]);

    return { connected, lastMessage, send };
}
