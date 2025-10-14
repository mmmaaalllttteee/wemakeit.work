'use client';

import { useState, useEffect } from 'react';
import {
  Folder,
  File,
  Download,
  Trash2,
  FolderPlus,
  ChevronRight,
  Grid,
  List,
  Search,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { FileUpload } from './FileUpload';

interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  isFolder: boolean;
  createdAt: string;
  uploader: {
    name: string;
  };
  downloadCount?: number;
}

interface FileBrowserProps {
  projectId?: string;
}

export default function FileBrowser({ projectId }: FileBrowserProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId, projectId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectId) {params.append('projectId', projectId);}
      if (currentFolderId) {params.append('folderId', currentFolderId);}
      if (searchQuery) {params.append('search', searchQuery);}

      const response = await fetch(`/api/v1/files?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: FileItem) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Go to root
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      const folder = folderPath[index];
      setCurrentFolderId(folder.id);
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {return;}

    try {
      const response = await fetch('/api/v1/files/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: newFolderName,
          projectId,
          parentId: currentFolderId,
        }),
      });

      if (response.ok) {
        setNewFolderName('');
        setIsCreateFolderModalOpen(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/v1/files/${file.id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {return;}

    try {
      const response = await fetch(`/api/v1/files/${file.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100  } ${  sizes[i]}`;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {return '🖼️';}
    if (mimeType.startsWith('video/')) {return '🎥';}
    if (mimeType.startsWith('audio/')) {return '🎵';}
    if (mimeType === 'application/pdf') {return '📄';}
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Files</h2>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="hover:text-white transition-colors"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="glass-panel rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setIsCreateFolderModalOpen(true)} variant="secondary">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>

          <Button onClick={() => setIsUploadModalOpen(true)}>
            <File className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel rounded-lg p-3 flex items-center gap-3">
        <Search className="w-5 h-5 text-white/60" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
          className="flex-1 bg-transparent border-none outline-none"
        />
      </div>

      {/* Files Grid/List */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <Folder className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <p className="text-white/60">No files yet</p>
          <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4">
            Upload your first file
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer group"
              onClick={() => file.isFolder && handleFolderClick(file)}
            >
              <div className="flex flex-col items-center text-center">
                {file.isFolder ? (
                  <Folder className="w-12 h-12 text-blue-400 mb-3" />
                ) : (
                  <div className="text-4xl mb-3">{getFileIcon(file.mimeType)}</div>
                )}
                <p className="font-medium text-sm mb-1 truncate w-full">{file.name}</p>
                {!file.isFolder && (
                  <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
                )}
                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!file.isFolder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="glass-panel rounded-lg p-4 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group"
              onClick={() => file.isFolder && handleFolderClick(file)}
            >
              {file.isFolder ? (
                <Folder className="w-6 h-6 text-blue-400 flex-shrink-0" />
              ) : (
                <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-white/60">
                  {formatDate(file.createdAt)} • {file.uploader.name}
                </p>
              </div>
              {!file.isFolder && (
                <p className="text-sm text-white/60">{formatFileSize(file.size)}</p>
              )}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!file.isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Files"
      >
        <FileUpload
          projectId={projectId}
          folderId={currentFolderId || undefined}
          onUploadComplete={() => {
            fetchFiles();
          }}
        />
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        title="Create Folder"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Folder Name</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Enter folder name"
              className="glass-input w-full"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
