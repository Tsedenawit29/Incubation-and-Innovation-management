// src/hooks/useWebSocket.js

import { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Custom hook to manage the WebSocket connection and chat state.
 */
export const useWebSocket = (chatRoomId, token) => {
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

                // Subscribe to the chat room topic
                client.subscribe(`/topic/chat/${chatRoomId}`, message => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, receivedMessage]);
                });
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
    }, [chatRoomId, token]);

    const sendMessage = (messageContent) => {
        if (stompClient && stompClient.connected && messageContent.trim()) {
            stompClient.publish({
                destination: `/app/chat.sendMessage/${chatRoomId}`,
                body: JSON.stringify({ content: messageContent }),
            });
        } else {
            console.error('Cannot send message: not connected or empty message.');
        }
    };

    return { messages, sendMessage };
};
