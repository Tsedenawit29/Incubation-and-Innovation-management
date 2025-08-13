# File Upload System for Applications

This document describes the comprehensive file upload system implemented for the IIMS application management platform.

## Overview

The file upload system allows applicants to attach supporting documents (pitch decks, business plans, financial statements, etc.) when submitting applications. The system handles file validation, storage, and retrieval with proper security measures.

## Backend Implementation

### 1. Database Entities

#### ApplicationDocument Entity
- **Location**: `iims/src/main/java/com/iims/iims/application_from/entity/ApplicationDocument.java`
- **Purpose**: Stores metadata about uploaded files
- **Key Fields**:
  - `id`: Unique identifier
  - `application`: Reference to the parent application
  - `fileName`: Generated unique filename
  - `originalFileName`: Original user filename
  - `filePath`: Path to stored file on disk
  - `fileSize`: File size in bytes
  - `contentType`: MIME type
  - `documentType`: Categorized type (PITCH_DECK, BUSINESS_PLAN, etc.)
  - `description`: Optional description
  - `uploadedAt`: Timestamp
  - `isActive`: Soft delete flag

### 2. DTOs

#### ApplicationDocumentRequest
- **Location**: `iims/src/main/java/com/iims/iims/application_from/dto/ApplicationDocumentRequest.java`
- **Purpose**: Handles file upload requests from frontend
- **Key Fields**:
  - `fileContent`: Base64 encoded file content
  - `fileSize`: File size validation
  - `contentType`: MIME type validation
  - `documentType`: Auto-detected from file extension

#### ApplicationDocumentDto
- **Location**: `iims/src/main/java/com/iims/iims/application_from/dto/ApplicationDocumentDto.java`
- **Purpose**: Returns file information to frontend
- **Key Fields**:
  - `downloadUrl`: Pre-built download link
  - All metadata from entity

### 3. Services

#### ApplicationDocumentService
- **Location**: `iims/src/main/java/com/iims/iims/application_from/service/ApplicationDocumentService.java`
- **Key Features**:
  - File upload with base64 decoding
  - Automatic file type detection
  - Unique filename generation
  - Directory structure management
  - Soft delete functionality
  - File download handling

#### ApplicationService Updates
- **Location**: `iims/src/main/java/com/iims/iims/application_from/service/ApplicationService.java`
- **New Features**:
  - Document handling during application submission
  - Document inclusion in application responses
  - Integration with approval workflow

### 4. Controllers

#### ApplicationDocumentController
- **Location**: `iims/src/main/java/com/iims/iims/application_from/controller/ApplicationDocumentController.java`
- **Endpoints**:
  - `POST /api/v1/applications/{applicationId}/documents` - Upload document
  - `GET /api/v1/applications/{applicationId}/documents` - List documents
  - `GET /api/v1/applications/documents/{documentId}` - Get document info
  - `GET /api/v1/applications/documents/{documentId}/download` - Download file
  - `DELETE /api/v1/applications/documents/{documentId}` - Delete document

### 5. Repository

#### ApplicationDocumentRepository
- **Location**: `iims/src/main/java/com/iims/iims/application_from/repository/ApplicationDocumentRepository.java`
- **Key Methods**:
  - `findByApplicationId()` - Get all documents for an application
  - `findByApplicationIdAndIsActiveTrue()` - Get active documents only
  - `findByApplicationIdAndDocumentType()` - Filter by document type

## Frontend Implementation

### 1. Core Components

#### FileUpload Component
- **Location**: `iims_frontend/src/components/FileUpload.jsx`
- **Features**:
  - Drag and drop interface
  - File type validation
  - Size validation
  - Multiple file support
  - Base64 encoding
  - File preview with metadata
  - Remove functionality

#### DocumentList Component
- **Location**: `iims_frontend/src/components/DocumentList.jsx`
- **Features**:
  - Document display with icons
  - File type categorization
  - Download links
  - Delete functionality (conditional)
  - File size and date formatting

### 2. Enhanced Forms

#### TenantApplicationForm
- **Location**: `iims_frontend/src/components/TenantApplicationForm.jsx`
- **Updates**:
  - Integrated file upload
  - Document management
  - Enhanced layout for file handling

#### EnhancedApplicationForm
- **Location**: `iims_frontend/src/components/EnhancedApplicationForm.jsx`
- **Features**:
  - Generic application form
  - Applicant type-specific document types
  - File upload integration
  - Flexible field handling

### 3. Application Management

#### ApplicationDetails Component
- **Location**: `iims_frontend/src/components/ApplicationDetails.jsx`
- **Features**:
  - Complete application view
  - Document display and management
  - Status management (approve/reject)
  - Document deletion (pending applications only)

### 4. API Integration

#### Applications API Service
- **Location**: `iims_frontend/src/api/applications.js`
- **Endpoints**:
  - Application CRUD operations
  - Document upload/download
  - Status updates
  - Document management

## File Type Support

### Supported Extensions
- **Documents**: `.pdf`, `.doc`, `.docx`
- **Presentations**: `.ppt`, `.pptx`
- **Spreadsheets**: `.xls`, `.xlsx`
- **Images**: `.jpg`, `.jpeg`, `.png`

### Document Type Auto-Detection
- **PITCH_DECK**: `.ppt`, `.pptx`
- **BUSINESS_PLAN**: `.doc`, `.docx`
- **FINANCIAL_STATEMENTS**: `.xls`, `.xlsx`
- **IMAGE**: `.jpg`, `.jpeg`, `.png`
- **DOCUMENT**: `.pdf`
- **OTHER**: Unrecognized extensions

## Security Features

### 1. File Validation
- File size limits (configurable, default 20MB)
- File type restrictions
- Maximum file count per application (configurable, default 10)

### 2. Storage Security
- Unique filename generation (UUID-based)
- Isolated directory structure per application
- Soft delete functionality
- Content type validation

### 3. Access Control
- Tenant-scoped access
- Application-level permissions
- Download link generation
- Delete restrictions based on application status

## Configuration

### Backend Configuration
```properties
# application.properties
app.upload.dir=uploads/applications
```

### Frontend Configuration
```javascript
// FileUpload component props
maxFileSize={20 * 1024 * 1024} // 20MB
maxFiles={10}
acceptedTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']}
```

## Usage Examples

### 1. Basic File Upload
```jsx
import FileUpload from './components/FileUpload';

<FileUpload
  onFileSelect={handleFileSelect}
  onFileRemove={handleFileRemove}
  label="Supporting Documents"
  description="Upload your pitch deck and business plan"
/>
```

### 2. Document Display
```jsx
import DocumentList from './components/DocumentList';

<DocumentList
  documents={documents}
  onDelete={handleDelete}
  showDelete={true}
/>
```

### 3. Application with Documents
```jsx
import EnhancedApplicationForm from './components/EnhancedApplicationForm';

<EnhancedApplicationForm
  formId={formId}
  applicantType="STARTUP"
  onSubmit={handleSubmit}
/>
```

## Integration Points

### 1. Application Approval Workflow
- Documents are automatically included when applications are approved
- File metadata is preserved for audit trails
- Download access is maintained for approved applications

### 2. User Creation
- When applications are approved, users are automatically created
- Startup profiles are created with document references
- Mentor profiles include uploaded credentials

### 3. Email Notifications
- Existing email system is reused for approval notifications
- Document information is included in application responses

## Error Handling

### 1. File Upload Errors
- Size limit exceeded
- Invalid file type
- Storage failures
- Base64 encoding issues

### 2. Application Errors
- Missing required documents
- File validation failures
- Storage quota exceeded

### 3. User Feedback
- Clear error messages
- Validation feedback
- Progress indicators
- Success confirmations

## Performance Considerations

### 1. File Size Limits
- Configurable maximum file sizes
- Client-side validation
- Server-side enforcement

### 2. Storage Optimization
- Efficient directory structure
- File deduplication (optional)
- Cleanup procedures

### 3. Download Optimization
- Streaming downloads for large files
- Caching headers
- Range request support

## Future Enhancements

### 1. Advanced Features
- File preview (PDF, image thumbnails)
- Document versioning
- Collaborative editing
- Digital signatures

### 2. Integration
- Cloud storage providers
- Document management systems
- E-signature services
- OCR processing

### 3. Analytics
- Upload/download statistics
- File type usage patterns
- Storage utilization metrics
- User behavior analysis

## Troubleshooting

### Common Issues
1. **File Upload Fails**: Check file size and type restrictions
2. **Documents Not Displaying**: Verify application ID and permissions
3. **Download Errors**: Check file path and storage configuration
4. **Permission Denied**: Verify tenant and application access

### Debug Information
- Check application logs for file operations
- Verify storage directory permissions
- Validate file metadata in database
- Test API endpoints independently

## Conclusion

The file upload system provides a robust, secure, and user-friendly way for applicants to submit supporting documents. It integrates seamlessly with the existing application workflow and provides administrators with comprehensive document management capabilities.

The system is designed to be scalable, maintainable, and extensible for future enhancements while maintaining security and performance standards.
