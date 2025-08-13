// src/components/ChatPage.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  ArrowLeft, 
  Send
} from 'lucide-react';


/**
 * Component to display a single chat room and handle message sending.
 */
const ChatPage = ({ chatRoom, chatRoomId, token, currentUser, onBack, onDelete }) => {
    const [newMessage, setNewMessage] = useState('');
    const { messages, sendMessage } = useWebSocket(chatRoomId, token);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(30);
    const messagesRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch(`http://localhost:8081/api/chat-rooms/${chatRoomId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Preload messages to the WebSocket list
                    // We can't push into hook state directly; render merges using local pre-state
                    // Instead, we render history above live messages
                    setLocalHistory(Array.isArray(data) ? data : []);
                } else {
                    setLocalHistory([]);
                }
            } catch (e) {
                setLocalHistory([]);
            } finally {
                setHistoryLoaded(true);
            }
        };
        loadHistory();
    }, [chatRoomId, token]);

    const [localHistory, setLocalHistory] = useState([]);

    // Combine history and live messages
    const allMessages = [...localHistory, ...messages];
    const startIndex = Math.max(0, allMessages.length - visibleCount);
    const visibleMessages = allMessages.slice(startIndex);

    // Auto-scroll to bottom on new messages if user is near bottom
    useEffect(() => {
        const container = messagesRef.current;
        if (!container) return;
        const threshold = 120; // px from bottom
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, [visibleMessages.length, chatRoomId]);

    // Load older chunk when scrolled to top
    const handleScroll = (e) => {
        const container = e.currentTarget;
        if (container.scrollTop < 50 && visibleCount < allMessages.length) {
            setVisibleCount((c) => Math.min(c + 30, allMessages.length));
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // optimistic update so it appears instantly
            const optimistic = {
                content: newMessage,
                timestamp: new Date().toISOString(),
                sender: {
                    id: currentUser?.id,
                    fullName: currentUser?.fullName,
                    email: currentUser?.email
                }
            };
            setLocalHistory(prev => [...prev, optimistic]);
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-[75vh] flex flex-col bg-white rounded-lg border border-gray-200">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{chatRoom?.chatName || 'Conversation'}</h2>
                        <p className="text-sm text-gray-600">{chatRoom?.users ? Array.from(chatRoom.users).map(u => u.fullName || u.email).join(', ') : 'Active now'}</p>
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={async () => {
                            try {
                                await fetch(`http://localhost:8081/api/chat-rooms/${chatRoomId}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                onDelete(chatRoomId);
                            } catch (e) {}
                        }}
                        className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                        Delete chat
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div ref={messagesRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {historyLoaded && (visibleMessages.length > 0) ? (
                    visibleMessages.map((msg, index) => {
                        const isOwn = msg?.sender?.id && currentUser?.id && msg.sender.id === currentUser.id;
                        const displayName = msg?.sender?.fullName || msg?.sender?.email || 'Unknown User';
                        const timeText = msg?.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium opacity-75">{displayName}</span>
                                        <span className="text-xs opacity-75">{timeText}</span>
                                    </div>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">No messages yet</div>
                        <p className="text-sm text-gray-500">Start the conversation by sending a message!</p>
                    </div>
                )}
                {visibleCount < allMessages.length && (
                    <div className="text-center text-xs text-gray-500 py-2">Scroll up to load older messages</div>
                )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Send size={16} />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;