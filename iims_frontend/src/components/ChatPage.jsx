// src/components/ChatPage.jsx

import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video
} from 'lucide-react';

/**
 * Component to display a single chat room and handle message sending.
 */
const ChatPage = ({ chatRoomId, token, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const { messages, sendMessage } = useWebSocket(chatRoomId, token); // Using the custom hook

    const handleSendMessage = () => {
        if (newMessage.trim()) {
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
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Chat Room: {chatRoomId}</h2>
                        <p className="text-sm text-gray-600">3 participants • Active now</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Phone size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Video size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender?.username === 'currentUser' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.sender?.username === 'currentUser' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium opacity-75">
                                        {msg.sender?.username || 'Unknown User'}
                                    </span>
                                    <span className="text-xs opacity-75">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">No messages yet</div>
                        <p className="text-sm text-gray-500">Start the conversation by sending a message!</p>
                    </div>
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
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <Paperclip size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <Smile size={16} className="text-gray-400" />
                            </button>
                        </div>
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