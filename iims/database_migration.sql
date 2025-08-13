-- Database migration script for chat system
-- Run this script to add the new columns to the chat_rooms table

-- Add new columns to chat_rooms table
ALTER TABLE chat_rooms 
ADD COLUMN IF NOT EXISTS chat_type VARCHAR(20) DEFAULT 'INDIVIDUAL',
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing chat rooms to have a default chat type
UPDATE chat_rooms SET chat_type = 'INDIVIDUAL' WHERE chat_type IS NULL;

-- Update existing chat rooms to be active
UPDATE chat_rooms SET is_active = true WHERE is_active IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_tenant_id ON chat_rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_chat_type ON chat_rooms(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'chat_rooms' 
ORDER BY ordinal_position;
