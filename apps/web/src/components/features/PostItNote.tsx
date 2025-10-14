'use client';

import { useState } from 'react';
import { X, Pin, Edit2, Check } from 'lucide-react';

interface PostItNoteProps {
  id: string;
  content: string;
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';
  isPinned?: boolean;
  onUpdate?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, isPinned: boolean) => void;
}

const colorClasses = {
  yellow: 'bg-yellow-400/90 hover:bg-yellow-400 text-yellow-900',
  blue: 'bg-blue-400/90 hover:bg-blue-400 text-blue-900',
  green: 'bg-green-400/90 hover:bg-green-400 text-green-900',
  pink: 'bg-pink-400/90 hover:bg-pink-400 text-pink-900',
  purple: 'bg-purple-400/90 hover:bg-purple-400 text-purple-900',
  orange: 'bg-orange-400/90 hover:bg-orange-400 text-orange-900',
};

export function PostItNote({
  id,
  content,
  color = 'yellow',
  isPinned = false,
  onUpdate,
  onDelete,
  onPin,
}: PostItNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== content) {
      onUpdate?.(id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg shadow-lg
        transition-all duration-300
        ${colorClasses[color]}
        hover:scale-[1.02] hover:rotate-1
        transform
        ${isPinned ? 'ring-2 ring-white/50' : ''}
      `}
      style={{
        minHeight: '150px',
        maxWidth: '250px',
      }}
    >
      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute -top-2 -right-2">
          <Pin className="w-5 h-5 fill-current" />
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPin?.(id, !isPinned)}
          className="p-1 rounded hover:bg-black/10 transition-colors"
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded hover:bg-black/10 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete?.(id)}
          className="p-1 rounded hover:bg-black/10 transition-colors"
          title="Delete"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 bg-black/10 rounded resize-none focus:outline-none focus:ring-2 focus:ring-black/20"
              rows={4}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleSave();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 bg-black/20 hover:bg-black/30 rounded text-sm transition-colors"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1 bg-black/10 hover:bg-black/20 rounded text-sm transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        )}
      </div>

      {/* Post-it tape effect */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white/20 rounded-sm" />
    </div>
  );
}
