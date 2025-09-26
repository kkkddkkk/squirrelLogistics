import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

//const RENDER_SERVER_HOST = "https://localhost:8080"
const RENDER_SERVER_HOST = "https://squirrellogistics.onrender.com"

export function useDriverStream(getToken) {
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const token = typeof getToken === 'function' ? getToken() : getToken;
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${RENDER_SERVER_HOST}/ws`),
      reconnectDelay: 3000,
      connectHeaders: { Authorization: `Bearer ${token}` }, 
      onConnect: () => {
        client.subscribe('/user/queue/driver', (msg) => {
          try { setRouteInfo(JSON.parse(msg.body)); } catch { }
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [getToken]);

  return routeInfo;
}

export function useCompanyStream(getToken, driverId) {
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const token = typeof getToken === "function" ? getToken() : getToken;
    if (!token) return;
    if (!driverId) return;


    if (!token || !driverId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${RENDER_SERVER_HOST}/ws`),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { Authorization: `Bearer ${token}` },

      onConnect: () => {
        client.subscribe(`/topic/driver/${driverId}`, (message) => {

          try {
            const payload = JSON.parse(message.body);

            setRouteInfo(payload);
          } catch (e) {

          }
        });
      },


    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [driverId]);

  return routeInfo;
}
