# Chat System Implementation

## Overview
The chat system has been enhanced to support individual chats between startups and mentors, as well as group chats created by tenant administrators. The system automatically creates individual chat rooms when mentor assignments are made.

## Backend Implementation

### New Entities and DTOs
- **Enhanced ChatRoom Entity**: Added chat types (INDIVIDUAL, GROUP, SUPPORT), tenant information, and creation metadata
- **ChatRoomDto**: Data transfer object for chat room information
- **CreateChatRoomRequest**: Request DTO for creating new chat rooms

### New Services
- **ChatService**: Enhanced with methods for creating individual and group chat rooms
- **ChatManagementService**: Service for tenant admins to create and manage group chats

### New Controllers
- **ChatRoomController**: REST API for basic chat room operations
- **ChatManagementController**: REST API for tenant admin chat management operations

## API Endpoints

### Chat Room Management
```
GET /api/chat-rooms                    - Get user's chat rooms
GET /api/chat-rooms/{id}              - Get specific chat room
POST /api/chat-rooms                  - Create new group chat room
POST /api/chat-rooms/individual       - Create/get individual chat room
DELETE /api/chat-rooms/{id}           - Deactivate chat room
```

### Chat Management (Tenant Admin)
```
POST /api/chat-management/startup-group    - Create startup group chat
POST /api/chat-management/mentor-group     - Create mentor group chat
POST /api/chat-management/cohort-group     - Create cohort group chat
GET /api/chat-management/group-chats/{tenantId}      - Get tenant group chats
GET /api/chat-management/individual-chats/{tenantId} - Get tenant individual chats
```

## Features

### 1. Individual Chat Rooms
- **Automatic Creation**: When a mentor is assigned to a startup, a chat room is automatically created
- **One-on-One Communication**: Direct communication between startup and mentor
- **Tenant Isolation**: Chat rooms are scoped to specific tenants

### 2. Group Chat Rooms
- **Startup Community**: Group chat for all startups in a tenant
- **Mentor Community**: Group chat for all mentors in a tenant
- **Cohort Groups**: Group chats based on cohort or industry
- **Admin Control**: Only tenant admins and super admins can create group chats

### 3. Chat Room Management
- **User Management**: Add/remove users from group chats
- **Chat Types**: Support for different chat room types
- **Access Control**: Role-based permissions for chat operations

## Database Schema

### Chat Rooms Table
```sql
CREATE TABLE chat_rooms (
    room_id UUID PRIMARY KEY,
    chat_name VARCHAR NOT NULL,
    chat_type VARCHAR NOT NULL, -- INDIVIDUAL, GROUP, SUPPORT
    tenant_id UUID,
    created_by UUID,
    created_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### Chat Room Users Table
```sql
CREATE TABLE chat_room_users (
    room_id UUID REFERENCES chat_rooms(room_id),
    user_id UUID REFERENCES users(id),
    PRIMARY KEY (room_id, user_id)
);
```

## Frontend Integration

### ChatOverview Component
- Displays user's chat rooms
- Shows chat type, participants, and last message
- Integrates with the new API endpoints

### Dashboard Integration
- **Mentor Dashboard**: Shows chats with assigned startups
- **Startup Dashboard**: Shows chats with assigned mentors
- **Tenant Admin Dashboard**: Shows all chats in the tenant
- **Super Admin Dashboard**: Shows global chat management

## Usage Examples

### Creating Individual Chat Room
```javascript
// This happens automatically when mentor is assigned
POST /api/chat-rooms/individual?startupId={startupId}&mentorId={mentorId}
```

### Creating Group Chat (Tenant Admin)
```javascript
// Create startup community chat
POST /api/chat-management/startup-group?tenantId={tenantId}&chatName=Startup Community

// Create mentor community chat
POST /api/chat-management/mentor-group?tenantId={tenantId}&chatName=Mentor Community
```

### Getting User's Chat Rooms
```javascript
GET /api/chat-rooms
Authorization: Bearer {token}
```

## Security Features

- **Role-Based Access**: Only authorized users can access chat rooms
- **Tenant Isolation**: Users can only access chats in their tenant
- **Permission Checks**: Chat creation and management require appropriate roles
- **JWT Authentication**: All endpoints require valid authentication tokens

## WebSocket Support

The existing WebSocket infrastructure supports real-time messaging:
- **Message Broadcasting**: Messages are sent to all users in a chat room
- **Chat History**: Messages are persisted in the database
- **Real-Time Updates**: Instant message delivery to connected clients

## Future Enhancements

1. **Message Notifications**: Email/SMS notifications for important messages
2. **File Sharing**: Support for document and media sharing
3. **Chat Search**: Search functionality for messages and chat rooms
4. **Chat Analytics**: Metrics and reporting for chat usage
5. **Mobile Support**: Mobile-optimized chat interface

## Troubleshooting

### Common Issues
1. **"Failed to load chat rooms"**: Check if backend is running and API endpoints are accessible
2. **Permission Denied**: Verify user has appropriate role and tenant access
3. **Chat Room Not Found**: Ensure chat room exists and user has access

### Debug Steps
1. Check backend logs for errors
2. Verify database connections and schema
3. Test API endpoints with Postman or similar tool
4. Check frontend console for JavaScript errors

## Getting Started

1. **Backend**: Ensure all dependencies are included in pom.xml
2. **Database**: Run the application to create necessary tables
3. **Frontend**: Update ChatOverview component to use new endpoints
4. **Testing**: Create test users and verify chat functionality

The chat system is now fully integrated and ready for production use!

