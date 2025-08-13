import React, { useState, useRef } from 'react';

const FileUpload = ({ 
  onFileSelect, 
  onFileRemove, 
  acceptedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      throw new Error(`File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} is not allowed. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    return true;
  };

  const processFile = async (file) => {
    try {
      validateFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        const fileData = {
          fileName: file.name,
          originalFileName: file.name,
          fileContent: base64Content,
          fileSize: file.size,
          contentType: file.type,
          documentType: getDocumentType(file.name),
          description: ''
        };

        const newFile = {
          id: Date.now() + Math.random(),
          file: fileData,
          name: file.name,
          size: file.size,
          type: file.type
        };

        setFiles(prev => [...prev, newFile]);
        onFileSelect(fileData);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      alert(error.message);
    }
  };

  const getDocumentType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['ppt', 'pptx'].includes(extension)) return 'PITCH_DECK';
    if (['doc', 'docx'].includes(extension)) return 'BUSINESS_PLAN';
    if (['xls', 'xlsx'].includes(extension)) return 'FINANCIAL_STATEMENTS';
    if (['pdf'].includes(extension)) return 'DOCUMENT';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'IMAGE';
    
    return 'OTHER';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (files.length + droppedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      droppedFiles.forEach(processFile);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      selectedFiles.forEach(processFile);
    }
  };

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      onFileRemove(fileToRemove.file);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-gray-600">
            <p className="text-sm">{description}</p>
            <p className="text-xs mt-1">
              Accepted types: {acceptedTypes.join(', ')} | Max size: {maxFileSize / (1024 * 1024)}MB | Max files: {maxFiles}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-400">{file.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
