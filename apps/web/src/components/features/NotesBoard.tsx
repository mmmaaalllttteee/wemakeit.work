'use client';

import { useState, useEffect } from 'react';
import { PostItNote } from './PostItNote';
import { Button } from '../ui/Button';
import { Plus, Loader2 } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';
  isPinned: boolean;
  scope: 'personal' | 'organization' | 'project';
  createdAt: string;
}

interface NotesBoardProps {
  scope?: 'personal' | 'organization' | 'project';
  projectId?: string;
}

const noteColors: Array<'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange'> = [
  'yellow',
  'blue',
  'green',
  'pink',
  'purple',
  'orange',
];

export default function NotesBoard({ scope = 'organization', projectId }: NotesBoardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<(typeof noteColors)[number]>('yellow');

  useEffect(() => {
    fetchNotes();
  }, [scope, projectId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope) {params.append('scope', scope);}
      if (projectId) {params.append('projectId', projectId);}

      const response = await fetch(`/api/v1/dashboard/notes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {return;}

    try {
      const response = await fetch('/api/v1/dashboard/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newNoteContent,
          color: newNoteColor,
          scope,
          projectId,
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        setNewNoteContent('');
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/v1/dashboard/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {return;}

    try {
      const response = await fetch(`/api/v1/dashboard/notes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handlePinNote = async (id: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/v1/dashboard/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ isPinned }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
      }
    } catch (error) {
      console.error('Failed to pin note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Notes</h2>
        <Button onClick={() => setIsAdding(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add new note */}
      {isAdding && (
        <div className="mb-6 glass-panel rounded-xl p-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note Content</label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="What's on your mind?"
                className="glass-input w-full resize-none"
                rows={4}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2">
                {noteColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewNoteColor(color)}
                    className={`
                      w-8 h-8 rounded-lg transition-all
                      ${color === 'yellow' ? 'bg-yellow-400' : ''}
                      ${color === 'blue' ? 'bg-blue-400' : ''}
                      ${color === 'green' ? 'bg-green-400' : ''}
                      ${color === 'pink' ? 'bg-pink-400' : ''}
                      ${color === 'purple' ? 'bg-purple-400' : ''}
                      ${color === 'orange' ? 'bg-orange-400' : ''}
                      ${newNoteColor === color ? 'ring-2 ring-white scale-110' : 'opacity-60'}
                    `}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddNote}>Add Note</Button>
              <Button variant="secondary" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <p className="text-white/60">No notes yet. Add your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="group">
              <PostItNote
                id={note.id}
                content={note.content}
                color={note.color}
                isPinned={note.isPinned}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
