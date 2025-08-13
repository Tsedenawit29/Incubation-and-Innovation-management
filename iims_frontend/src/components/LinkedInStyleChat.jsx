import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  X, 
  Send, 
  Plus,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Minimize2,
  Maximize2,
  ArrowLeft
} from 'lucide-react';

const LinkedInStyleChat = ({ token, currentUser }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatData, setNewChatData] = useState({
    chatName: '',
    chatType: 'INDIVIDUAL',
    participants: []
  });

  // Mock data for development
  const mockChatRooms = [
    {
      id: 1,
      chatName: 'Startup Discussion',
      participants: ['John Doe', 'Jane Smith'],
      lastMessage: 'Great progress on the MVP!',
      lastMessageTime: '2 hours ago',
      unreadCount: 3,
      type: 'INDIVIDUAL'
    },
    {
      id: 2,
      chatName: 'Mentor Support',
      participants: ['Sarah Wilson', 'David Brown'],
      lastMessage: 'When is the next meeting?',
      lastMessageTime: '1 day ago',
      unreadCount: 1,
      type: 'GROUP'
    }
  ];

  useEffect(() => {
    fetchChatRooms();
  }, [token]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/chat-rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChatRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
      setError('Failed to load chat rooms. Please try again.');
      setChatRooms(mockChatRooms);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!newChatData.chatName.trim()) {
      setError('Chat name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // For now, create a mock chat room
      const newChat = {
        id: Date.now(),
        chatName: newChatData.chatName,
        participants: newChatData.participants,
        lastMessage: '',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        type: newChatData.chatType
      };

      setChatRooms(prev => [newChat, ...prev]);
      setSelectedChatRoom(newChat);
      setShowNewChatModal(false);
      setNewChatData({ chatName: '', chatType: 'INDIVIDUAL', participants: [] });
      
      // TODO: Replace with actual API call
      // const response = await axios.post('http://localhost:8081/api/chat-rooms', newChatData, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
    } catch (error) {
      setError('Failed to create chat room');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChatRoom) {
      // TODO: Implement actual message sending
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
        >
          <MessageSquare size={24} />
          {chatRooms.some(chat => chat.unreadCount > 0) && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {chatRooms.reduce((sum, chat) => sum + chat.unreadCount, 0)}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'
      }`}>
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} />
            <div>
              <h3 className="font-semibold">Chats</h3>
              <p className="text-xs opacity-90">
                {chatRooms.length} conversations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {!selectedChatRoom ? (
            // Chat List View
            <div className="flex-1 overflow-hidden">
              {/* New Chat Button */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  New Chat
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600 text-sm">{error}</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {chatRooms
                      .filter(chat => 
                        chat.chatName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChatRoom(chat)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {chat.chatName}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{chat.lastMessageTime}</p>
                              {chat.unreadCount > 0 && (
                                <span className="inline-block mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Individual Chat View
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChatRoom(null)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ArrowLeft size={16} className="text-gray-600" />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{selectedChatRoom.chatName}</h4>
                    <p className="text-xs text-gray-500">
                      {selectedChatRoom.participants?.join(', ')} • Active now
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <Phone size={14} className="text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <Video size={14} className="text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <MoreVertical size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No messages yet</div>
                  <p className="text-sm text-gray-500">Start the conversation!</p>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows={1}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      <Paperclip size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      <Smile size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
            
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
                  disabled={loading || !newChatData.chatName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInStyleChat;
