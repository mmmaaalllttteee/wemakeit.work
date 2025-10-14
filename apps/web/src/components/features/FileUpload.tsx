'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  projectId?: string;
  folderId?: string;
  onUploadComplete?: (file: any) => void;
  multiple?: boolean;
  maxSize?: number; // in MB
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  id?: string;
}

export function FileUpload({
  projectId,
  folderId,
  onUploadComplete,
  multiple = true,
  maxSize = 500,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      // 1. Initialize upload - get presigned URL
      const initResponse = await fetch('/api/v1/files/upload/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          projectId,
          folderId,
        }),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize upload');
      }

      const { uploadUrl, fileId, path } = await initResponse.json();

      // 2. Upload to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // 3. Complete upload
      const completeResponse = await fetch('/api/v1/files/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          fileId,
          path,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const uploadedFile = await completeResponse.json();

      // Update status
      setUploadingFiles((prev) =>
        prev.map((uf) =>
          uf.file === file ? { ...uf, status: 'success', progress: 100, id: uploadedFile.id } : uf,
        ),
      );

      onUploadComplete?.(uploadedFile);

      // Remove from list after 2 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles((prev) =>
        prev.map((uf) =>
          uf.file === file ? { ...uf, status: 'error', error: error.message } : uf,
        ),
      );
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {return;}

      const fileArray = Array.from(files);

      // Validate files
      const validFiles = fileArray.filter((file) => {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSize) {
          alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
          return false;
        }
        return true;
      });

      // Add to uploading list
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading',
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Start uploads
      validFiles.forEach((file) => uploadFile(file));
    },
    [maxSize],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100  } ${  sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          glass-panel rounded-xl p-8 border-2 border-dashed transition-all
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20'}
          hover:border-white/40 cursor-pointer
        `}
      >
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-400' : 'text-white/60'}`} />
          <p className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-sm text-white/60">Maximum file size: {maxSize}MB</p>
          <input
            type="file"
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uf, index) => (
            <div
              key={`${uf.file.name}-${index}`}
              className="glass-panel rounded-lg p-4 flex items-center gap-4"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {uf.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                )}
                {uf.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {uf.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileIcon className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <p className="text-sm font-medium truncate">{uf.file.name}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span>{formatFileSize(uf.file.size)}</span>
                  {uf.status === 'uploading' && <span>{uf.progress}%</span>}
                  {uf.status === 'success' && (
                    <span className="text-green-400">Uploaded successfully</span>
                  )}
                  {uf.status === 'error' && (
                    <span className="text-red-400">{uf.error || 'Upload failed'}</span>
                  )}
                </div>
                {/* Progress Bar */}
                {uf.status === 'uploading' && (
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uf.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {uf.status === 'error' && (
                <button
                  onClick={() => removeFile(uf.file)}
                  className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
