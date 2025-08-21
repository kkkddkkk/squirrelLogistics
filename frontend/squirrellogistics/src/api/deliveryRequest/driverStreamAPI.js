import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useDriverStream(driverId) {
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!driverId) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/driver/${driverId}`, (msg) => {
        try { setRouteInfo(JSON.parse(msg.body)); } catch {}
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [driverId]);

  return routeInfo; // { visited, expected, currentPosition, distance, duration }
}