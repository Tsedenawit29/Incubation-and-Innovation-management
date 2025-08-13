// src/hooks/useWebSocket.js

import { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Custom hook to manage the WebSocket connection and chat state.
 */
export const useWebSocket = (chatRoomId, token, options = {}) => {
    const { tenantId, onRoomNotification } = options;
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!chatRoomId || !token) return;

        // Create STOMP client using SockJS
        const socketFactory = () => new SockJS('http://localhost:8081/ws');
        const client = new Client({
            webSocketFactory: socketFactory,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('Connected to WebSocket');

                // Subscribe to the chat room topic (use JSON payload from backend)
                client.subscribe(`/topic/chat/${chatRoomId}`, message => {
                    try {
                        const receivedMessage = JSON.parse(message.body);
                        setMessages(prev => [...prev, receivedMessage]);
                    } catch (e) {
                        // Fallback if payload isn't JSON; still display text
                        setMessages(prev => [...prev, { content: message.body }]);
                    }
                });

                // Subscribe to tenant-level notifications to update unread counters
                if (tenantId && onRoomNotification) {
                    client.subscribe(`/topic/chat-notify/${tenantId}`, frame => {
                        try {
                            const notif = JSON.parse(frame.body);
                            onRoomNotification(notif);
                        } catch (e) {}
                    });
                }
            },
            onStompError: frame => {
                console.error('Broker reported error:', frame.headers['message']);
                console.error('Details:', frame.body);
            },
            debug: str => {
                console.log(str);
            },
            reconnectDelay: 5000, // auto-reconnect after 5s
        });

        client.activate();
        setStompClient(client);

        // Cleanup on unmount
        return () => {
            if (client && client.active) {
                client.deactivate();
                console.log('Disconnected from WebSocket');
            }
        };
    }, [chatRoomId, token, tenantId, onRoomNotification]);

    const sendMessage = (messageContent) => {
        if (stompClient && stompClient.connected && messageContent.trim()) {
            stompClient.publish({
                destination: `/app/chat.sendMessage/${chatRoomId}`,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ content: messageContent }),
            });
        } else {
            console.error('Cannot send message: not connected or empty message.');
        }
    };

    return { messages, sendMessage };
};
