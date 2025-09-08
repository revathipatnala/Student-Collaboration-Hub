import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { Heart } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';
import type { Note } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import MainHeader from '../components/MainHeader';

const Posts: React.FC = () => {
  const [openComments, setOpenComments] = useState<{ [noteId: string]: boolean }>({});

  const handleToggleComments = (noteId: string) => {
    setOpenComments(prev => ({ ...prev, [noteId]: !prev[noteId] }));
  };
  const [editingComment, setEditingComment] = useState<{ noteId: string; commentId: string; text: string } | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null);

  const handleEditComment = (noteId: string, commentId: string, text: string) => {
    setEditingComment({ noteId, commentId, text });
  };

  const handleEditCommentSubmit = async () => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error('Comment must have characters');
      return;
    }
    setEditCommentLoading(editingComment.commentId);
    try {
      const response = await notesAPI.editComment(editingComment.noteId, editingComment.commentId, editingComment.text.trim());
      setNotes(prev => prev.map(note => note.id === editingComment.noteId ? { ...note, comments: response.data.comments } : note));
      setEditingComment(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setEditCommentLoading(null);
    }
  };

  const handleDeleteComment = async (noteId: string, commentId: string) => {
    setDeleteCommentLoading(commentId);
    try {
      const response = await notesAPI.deleteComment(noteId, commentId);
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, comments: response.data.comments } : note));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };
  const [commentInputs, setCommentInputs] = useState<{ [noteId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);

  const handleCommentInput = (noteId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [noteId]: value }));
  };

  const handleAddComment = async (noteId: string) => {
    const text = commentInputs[noteId]?.trim();
    if (!user?.id) {
      toast.error('Login to comment');
      return;
    }
    if (!text) {
      toast.error('Comment cannot be empty');
      return;
    }
    setCommentLoading(noteId);
    try {
      const response = await notesAPI.addComment(noteId, text);
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, comments: response.data.comments } : note));
      setCommentInputs(prev => ({ ...prev, [noteId]: '' }));
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(null);
    }
  };
  const [showMyPosts, setShowMyPosts] = useState(false);
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  // Extend Note type locally to allow photo: File | null for editing
  type EditingNote = Note & { photo?: File | null };
  const [editingNote, setEditingNote] = useState<EditingNote | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', photo: null as File | null });
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null); // noteId for which like/unlike is loading
  const handleLike = async (noteId: string, liked: boolean) => {
    if (!user?.id) {
      toast.error('Login to like posts');
      return;
    }
    setLikeLoading(noteId);
    try {
      if (liked) {
        await notesAPI.unlikeNote(noteId);
        setNotes(prev => prev.map(note => note.id === noteId ? { ...note, likes: Array.isArray(note.likes) ? note.likes.filter(uid => uid !== user.id) : [] } : note));
        toast.success('Unliked post');
      } else {
        await notesAPI.likeNote(noteId);
        setNotes(prev => prev.map(note => note.id === noteId ? { ...note, likes: Array.isArray(note.likes) ? [...note.likes, user.id] : [user.id] } : note));
        toast.success('Liked post');
      }
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(null);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsCreating(true);
    try {
      const response = await notesAPI.createNote({
        title: newNote.title,
        content: newNote.content,
        createdBy: user?.id || '',
        photo: newNote.photo
      });
      setNotes(prev => [response.data.note, ...prev]);
      setNewNote({ title: '', content: '', photo: null });
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewNote(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title.trim() || !editingNote.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      let response;
      response = await notesAPI.updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        photo: editingNote.photo || undefined
      });
      setNotes(prev => prev.map(note => note.id === editingNote.id ? response.data.note : note));
      setEditingNote(null);
      toast.success('Post updated successfully!');
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating My Posts button at top right of viewport */}
      <button
        onClick={() => setShowMyPosts((prev) => !prev)}
        className="fixed top-20 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
        style={{ minWidth: '120px' }}
      >
        My Posts
      </button>
      <MainHeader title="Student Hub" />
      <div className="mt-16" /> {/* Increased spacer between header and form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Note Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h2>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <Input
              placeholder="Post title..."
              value={newNote.title}
              onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              placeholder="Write your description here..."
              value={newNote.content}
              onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <Input name="photo" type="file" onChange={handlePhotoChange} />
            <Button type="submit" isLoading={isCreating} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Button>
          </form>
        </div>
        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
            <span className="text-sm text-gray-500">{notes.length} posts</span>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Create your first post to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => {
                const likesArr = Array.isArray(note.likes) ? note.likes : [];
                const liked = !!user?.id && likesArr.includes(user.id);
                return (
                  <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 relative">
                    {editingNote?.id === note.id ? (
                      <form onSubmit={handleUpdateNote} className="space-y-4">
                        <Input
                          value={editingNote.title}
                          onChange={e => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                        />
                        <textarea
                          value={editingNote.content}
                          onChange={e => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                          rows={4}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        />
                        {/* Show current photo if exists */}
                        {editingNote.photoUrl && (
                          <img src={editingNote.photoUrl} alt="Current" className="max-w-xs rounded mb-2" />
                        )}
                        <Input name="photo" type="file" onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setEditingNote(prev => prev ? { ...prev, photo: e.target.files![0] } : null);
                          }
                        }} />
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm">Save</Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNote(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {note.title}
                          </h3>
                          {note.createdBy === user?.id && (
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => setEditingNote(note)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        {note.photoUrl && (
                          <img
                            src={note.photoUrl}
                            alt={note.title}
                            className="w-full max-h-64 object-contain rounded mb-4 border bg-gray-100 cursor-pointer"
                            style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                            onClick={() => setModalImage(note.photoUrl || null)}
                          />
                        )}
                        <p className="text-gray-600 mb-4">
                          {note.content}
                        </p>
                        <div className="text-xs text-gray-400 mb-2">
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {note.createdByName && (
                          <div className="text-xs text-gray-500 mt-2 mb-2">Created By: <span className="font-semibold text-blue-700">{note.createdByName}</span></div>
                        )}
                        {/* Like button under Created By field, at the end of card */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={likeLoading === note.id}
                              onClick={() => handleLike(note.id, liked)}
                              className={`p-2 rounded-full transition-colors duration-200 flex items-center ${liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} hover:bg-red-200 hover:text-red-700`}
                              title={liked ? 'Unlike' : 'Like'}
                            >
                              <Heart className={`w-5 h-5 ${liked ? 'fill-red-600' : ''}`} fill={liked ? 'currentColor' : 'none'} />
                            </button>
                            <span className="text-sm font-semibold text-gray-700">{likesArr.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleComments(note.id)}
                              className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[note.id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                              title={openComments[note.id] ? 'Hide Comments' : 'Show Comments'}
                            >
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-semibold text-gray-700">{note.comments?.length || 0}</span>
                          </div>
                        </div>
                        {/* Comments section */}
                        {openComments[note.id] && (
                          <div className="mt-6">
                            <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                            <div className="space-y-2 mb-2">
                              {note.comments && note.comments.length > 0 ? (
                                note.comments.map((comment, idx) => {
                                  const isAuthor = user?.id && comment.userId === user.id;
                                  const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.noteId === note.id;
                                  return (
                                    <div key={comment._id || idx} className="bg-gray-50 rounded px-3 py-2 text-sm flex items-center justify-between">
                                      <div className="flex-1">
                                        <span className="font-semibold text-blue-700">{comment.userName}:</span> {' '}
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editingComment.text}
                                            onChange={e => setEditingComment(editingComment ? { ...editingComment, text: e.target.value } : null)}
                                            className="px-2 py-1 border rounded text-sm"
                                            disabled={editCommentLoading === comment._id}
                                          />
                                        ) : (
                                          <span>{comment.text}</span>
                                        )}
                                        <span className="ml-2 text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                      </div>
                                      {isAuthor && (
                                        <div className="flex gap-2 ml-2">
                                          {isEditing ? (
                                            <>
                                              <button
                                                onClick={handleEditCommentSubmit}
                                                disabled={editCommentLoading === comment._id}
                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => setEditingComment(null)}
                                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => handleEditComment(note.id, comment._id, comment.text)}
                                                className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                                title="Edit Comment"
                                              >
                                                <Edit3 className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteComment(note.id, comment._id)}
                                                disabled={deleteCommentLoading === comment._id}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                                                title="Delete Comment"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-gray-400">No comments yet.</div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={commentInputs[note.id] || ''}
                                onChange={e => handleCommentInput(note.id, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a comment..."
                                disabled={commentLoading === note.id}
                              />
                              <button
                                onClick={() => handleAddComment(note.id)}
                                disabled={commentLoading === note.id}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                              >
                                {commentLoading === note.id ? 'Posting...' : 'Comment'}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  {/* Modal for enlarged image */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setModalImage(null)}>
          <div className="flex flex-col items-center">
            <img
              src={modalImage}
              alt="Enlarged"
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border-4 border-white mb-4"
              style={{ objectFit: 'contain' }}
              onClick={e => e.stopPropagation()}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition mb-2"
              onClick={e => {
                e.stopPropagation();
                if (modalImage) {
                  fetch(modalImage)
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'image.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    });
                }
              }}
            >
              Download Image
            </button>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-900 transition mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setModalImage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* My Posts Modal */}
      {showMyPosts && (
        <div className="fixed top-0 left-0 w-full h-full z-50" onClick={() => setShowMyPosts(false)}>
          <div className="absolute top-20 right-8 bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg border border-gray-200 overflow-y-auto" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">My Posts</h2>
            {notes.filter(note => note.createdBy === user?.id).length === 0 ? (
              <p className="text-gray-500">You haven't created any posts yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {notes.filter(note => note.createdBy === user?.id).map(note => (
                  <div key={note.id} className="bg-white shadow rounded-lg p-6 flex flex-col gap-2 relative">
                    {/* Edit/Delete buttons at top right */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-bold text-blue-700 mb-1 text-lg">{note.title}</div>
                    <div className="mb-2 text-gray-700">Description: <span className="font-normal">{note.content}</span></div>
                    {note.photoUrl && (
                      <img src={note.photoUrl} alt={note.title} className="max-w-xs rounded mb-2" />
                    )}
                    <div className="text-xs text-gray-400 mb-2">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {note.createdByName && (
                      <div className="text-xs text-gray-500 mt-2">Created By: <span className="font-semibold text-blue-700">{note.createdByName}</span></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
