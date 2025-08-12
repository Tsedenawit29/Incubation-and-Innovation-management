// src/components/ChatOverview.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatPage from './ChatPage';

const ChatOverview = ({ token, currentUser }) => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/chat-rooms', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setChatRooms(response.data);
            } catch (error) {
                console.error("Failed to fetch chat rooms:", error);
            }
        };

        fetchChatRooms();
    }, [token]);

    if (selectedChatRoom) {
        return <ChatPage chatRoomId={selectedChatRoom.id} token={token} onBack={() => setSelectedChatRoom(null)} />;
    }

    return (
        <div>
            <h2>My Chats</h2>
            <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                {chatRooms.length > 0 ? (
                    chatRooms.map(room => (
                        <div key={room.id} onClick={() => setSelectedChatRoom(room)} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                            {room.chatName || 'Unnamed Chat'}
                        </div>
                    ))
                ) : (
                    <p>No chat rooms found.</p>
                )}
            </div>
        </div>
    );
};

export default ChatOverview;