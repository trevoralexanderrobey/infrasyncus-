import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Zettelkasten.css';
import { useNavigate } from 'react-router-dom';
import { GraphVisualization } from './GraphVisualization';

type Note = {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
};

type Link = {
  source: string;
  target: string;
};

export const Zettelkasten: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get('/api/zettelkasten/notes', {
        params: { password },
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!currentNote.trim()) return;
    setIsLoading(true);
    setError('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      await axios.post('/api/zettelkasten/notes', { 
        content: currentNote,
        tags: currentTags,
        password,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setCurrentNote('');
      setCurrentTags([]);
      fetchNotes();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid Zettelkasten password');
        setPassword('');
      } else {
        setError('Failed to create note: ' + (err.response?.data?.message || err.message));
      }
      console.error('Error creating note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createLink = async (noteId1: string, noteId2: string) => {
    setIsLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post('/api/zettelkasten/links', { 
        noteId1, 
        noteId2, 
        password 
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      fetchGraph(selectedNote?.id || '');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid Zettelkasten password');
        setPassword('');
      } else {
        setError('Failed to create link: ' + (err.response?.data?.message || err.message));
      }
      console.error('Error creating link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGraph = async (noteId: string) => {
    if (!noteId) return;
    setIsLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`/api/zettelkasten/notes/${noteId}/connections`, { 
        params: { password },
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setLinks(response.data);
    } catch (err) {
      setError('Failed to fetch connections: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async (noteId: string) => {
    if (!noteId) return;
    setIsLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`/api/zettelkasten/notes/${noteId}/suggestions`, { 
        params: { password },
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setSuggestions(response.data);
    } catch (err) {
      setError('Failed to fetch suggestions: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (selectedNote) {
      fetchGraph(selectedNote.id);
      fetchSuggestions(selectedNote.id);
    }
  }, [selectedNote]);

  // Prepare data for GraphVisualization component
  const graphNodes = selectedNote ? [
    { id: selectedNote.id, label: selectedNote.content.substring(0, 30), type: 'note' },
    ...links.map(link => {
      const id = link.source === selectedNote.id ? link.target : link.source;
      return { id, label: id, type: 'note' };
    })
  ] : [];

  const graphEdges = links.map(link => ({
    source: link.source,
    target: link.target,
    label: ''
  }));

  return (
    <div className="zettelkasten-container">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      <div className="view-toggle">
        <button 
          className={viewMode === 'graph' ? 'active' : ''}
          onClick={() => setViewMode('graph')}
          disabled={isLoading}
        >
          Graph View
        </button>
        <button 
          className={viewMode === 'timeline' ? 'active' : ''}
          onClick={() => setViewMode('timeline')}
          disabled={isLoading}
        >
          Timeline View
        </button>
      </div>
      <div className="note-creator">
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Enter a new note..."
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Add tags (comma separated)"
          onChange={(e) => setCurrentTags(e.target.value.split(',').map(tag => tag.trim()))}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Enter Zettelkasten password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <button onClick={createNote} disabled={isLoading || !currentNote.trim()}>
          {isLoading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      <div className="notes-list">
        <h3>Notes</h3>
        <ul>
          {notes.map((note) => (
            <li 
              key={note.id} 
              className={selectedNote?.id === note.id ? 'selected' : ''}
              onClick={() => setSelectedNote(note)}
            >
              {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
            </li>
          ))}
        </ul>
      </div>

      {selectedNote && viewMode === 'graph' && (
        <div className="note-details">
          <h3>Selected Note</h3>
          <p>{selectedNote.content}</p>
          
          <div className="graph-visualization">
            <h4>Connections</h4>
            {links.length > 0 ? (
              <>
                <div className="graph-container">
                  <GraphVisualization nodes={graphNodes} edges={graphEdges} />
                </div>
                <div className="text-connections">
                  {links.map((link, i) => (
                    <div key={i} className="connection">
                      {link.source === selectedNote.id ? '→' : '←'} {link.source === selectedNote.id ? link.target : link.source}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>No connections found for this note.</p>
            )}
          </div>

          <div className="suggestions">
            <h4>Suggested Connections</h4>
            <ul>
              {suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {viewMode === 'timeline' && (
        <div className="timeline-view">
          <h3>Timeline</h3>
          <div className="timeline">
            {notes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note) => (
                <div key={note.id} className="timeline-item">
                  <div className="timeline-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  <div 
                    className="timeline-content"
                    onClick={() => setSelectedNote(note)}
                  >
                    {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
                    <div className="tags">
                      {note.tags?.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};