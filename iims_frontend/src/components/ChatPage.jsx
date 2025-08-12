// src/components/ChatPage.jsx

import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * Component to display a single chat room and handle message sending.
 */
const ChatPage = ({ chatRoomId, token, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const { messages, sendMessage } = useWebSocket(chatRoomId, token); // Using the custom hook

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div>
            <button onClick={onBack}>&larr; Back to Chats</button>
            <h2>Chat Room: {chatRoomId}</h2>
            <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender.username}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '10px' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatPage;