// src/components/ChatOverview.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatPage from './ChatPage';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Search,
  Plus,
  Filter,
  MoreVertical,
  X
} from 'lucide-react';

const ChatOverview = ({ token, currentUser }) => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [newChatData, setNewChatData] = useState({
        chatName: '',
        chatType: 'INDIVIDUAL',
        participants: []
    });
    const [creatingChat, setCreatingChat] = useState(false);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {

                setLoading(true);

                const response = await axios.get('http://localhost:8081/api/chat-rooms', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setChatRooms(response.data);
            } catch (error) {
                console.error("Failed to fetch chat rooms:", error);

                setError('Failed to load chat rooms. Please try again.');
                // Mock data for development
                setChatRooms([
                    {
                        id: 1,
                        chatName: 'Startup Discussion',
                        participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                        lastMessage: 'Great progress on the MVP!',
                        lastMessageTime: '2 hours ago',
                        unreadCount: 3,
                        type: 'startup'
                    },
                    {
                        id: 2,
                        chatName: 'Mentor Support',
                        participants: ['Sarah Wilson', 'David Brown'],
                        lastMessage: 'When is the next meeting?',
                        lastMessageTime: '1 day ago',
                        unreadCount: 1,
                        type: 'mentor'
                    },
                    {
                        id: 3,
                        chatName: 'General Questions',
                        participants: ['Team Lead', 'New Member'],
                        lastMessage: 'Welcome to the team!',
                        lastMessageTime: '3 days ago',
                        unreadCount: 0,
                        type: 'general'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, [token]);

    const handleNewChat = async () => {
        if (!newChatData.chatName.trim()) {
            setError('Chat name is required');
            return;
        }

        try {
            setCreatingChat(true);
            setError('');
            
            // For now, create a mock chat room
            const newChat = {
                id: Date.now(),
                chatName: newChatData.chatName,
                participants: newChatData.participants,
                lastMessage: '',
                lastMessageTime: 'Just now',
                unreadCount: 0,
                type: newChatData.chatType.toLowerCase()
            };

            setChatRooms(prev => [newChat, ...prev]);
            setShowNewChatModal(false);
            setNewChatData({ chatName: '', chatType: 'INDIVIDUAL', participants: [] });
            
            // TODO: Replace with actual API call when backend is ready
            // const response = await axios.post('http://localhost:8081/api/chat-rooms', {
            //     chatName: newChatData.chatName,
            //     chatType: newChatData.chatType,
            //     tenantId: currentUser?.tenantId,
            //     userIds: newChatData.participants
            // }, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            
        } catch (error) {
            setError('Failed to create chat room');
        } finally {
            setCreatingChat(false);
        }
    };

    if (selectedChatRoom) {
        return <ChatPage chatRoomId={selectedChatRoom.id} token={token} onBack={() => setSelectedChatRoom(null)} />;
    }

    const filteredChats = chatRooms.filter(room => {
        const matchesSearch = room.chatName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            room.participants?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'all' || room.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const getChatTypeColor = (type) => {
        switch (type) {
            case 'startup': return 'bg-blue-100 text-blue-700';
            case 'mentor': return 'bg-green-100 text-green-700';
            case 'admin': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading chats...</span>
            </div>
        );
    }

    if (error && !creatingChat) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Chat Conversations</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {filteredChats.length} of {chatRooms.length} chats
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowNewChatModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} className="mr-2" />
                        New Chat
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search chats or participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'startup', 'mentor', 'admin', 'general'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterType === type
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredChats.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {filteredChats.map((room) => (
                            <div 
                                key={room.id} 
                                onClick={() => setSelectedChatRoom(room)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {room.chatName || 'Unnamed Chat'}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChatTypeColor(room.type)}`}>
                                                {room.type}
                                            </span>
                                            {room.unreadCount > 0 && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Users size={14} />
                                            <span className="truncate">
                                                {room.participants?.join(', ') || 'No participants'}
                                            </span>
                                        </div>
                                        
                                        {room.lastMessage && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MessageSquare size={14} />
                                                <span className="truncate">{room.lastMessage}</span>
                                                <Clock size={14} />
                                                <span>{room.lastMessageTime}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <MoreVertical size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No chats found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterType !== 'all' 
                                ? 'Try adjusting your search or filters'
                                : 'Start a new conversation to get started'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Create New Chat</h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chat Name
                                </label>
                                <input
                                    type="text"
                                    value={newChatData.chatName}
                                    onChange={(e) => setNewChatData(prev => ({ ...prev, chatName: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter chat name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chat Type
                                </label>
                                <select
                                    value={newChatData.chatType}
                                    onChange={(e) => setNewChatData(prev => ({ ...prev, chatType: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="INDIVIDUAL">Individual Chat</option>
                                    <option value="GROUP">Group Chat</option>
                                </select>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm">{error}</div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowNewChatModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNewChat}
                                    disabled={creatingChat || !newChatData.chatName.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {creatingChat ? 'Creating...' : 'Create Chat'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatOverview;