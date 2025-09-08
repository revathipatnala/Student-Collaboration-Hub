import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Heart, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';
import type { Note } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import MainHeader from '../components/MainHeader';
import api from '../services/api';

const Dashboard: React.FC = () => {
  // Like/comment state for all item types
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ itemId: string; commentId: string; text: string } | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  // Helper functions
  const handleToggleComments = (itemId: string) => {
    setOpenComments(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const handleCommentInput = (itemId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [itemId]: value }));
  };

  // Like logic for all item types
  const handleLike = async (type: string, itemId: string, liked: boolean) => {
    if (!user?.id) {
      toast.error('Login to like items');
      return;
    }
    setLikeLoading(itemId);
    try {
      let url = '';
      if (type === 'event') url = `/events/${itemId}/${liked ? 'unlike' : 'like'}`;
      if (type === 'post') url = `/notes/${itemId}/${liked ? 'unlike' : 'like'}`;
      if (type === 'club') url = `/clubs/${itemId}/${liked ? 'unlike' : 'like'}`;
      if (type === 'sell') url = `/sell-and-buy/${itemId}/${liked ? 'unlike' : 'like'}`;
      if (type === 'lost') url = `/lost-and-found/${itemId}/${liked ? 'unlike' : 'like'}`;
      await api.post(url, { userId: user.id });
      // Refetch data for the type
      if (type === 'event') fetchAllEvents();
      if (type === 'post') fetchNotes();
      if (type === 'club') fetchAllClubs();
      if (type === 'sell') fetchSellAndBuy();
      if (type === 'lost') fetchLostAndFound();
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(null);
    }
  };

  // Comment logic for all item types
  const handleAddComment = async (type: string, itemId: string) => {
    const text = commentInputs[itemId]?.trim();
    if (!user?.id) {
      toast.error('Login to comment');
      return;
    }
    if (!text) {
      toast.error('Comment cannot be empty');
      return;
    }
    setCommentLoading(itemId);
    try {
      let url = '';
      if (type === 'event') url = `/events/${itemId}/comment`;
      if (type === 'post') url = `/notes/${itemId}/comment`;
      if (type === 'club') url = `/clubs/${itemId}/comment`;
      if (type === 'sell') url = `/sell-and-buy/${itemId}/comment`;
      if (type === 'lost') url = `/lost-and-found/${itemId}/comment`;
      // Actually send the comment to the backend
      await api.post(url, { text, userId: user.id, userName: user.fullName });
      // Refetch data for the type
      if (type === 'event') fetchAllEvents();
      if (type === 'post') fetchNotes();
      if (type === 'club') fetchAllClubs();
      if (type === 'sell') fetchSellAndBuy();
      if (type === 'lost') fetchLostAndFound();
      setCommentInputs(prev => ({ ...prev, [itemId]: '' }));
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(null);
    }
  };

  const handleEditComment = (itemId: string, commentId: string, text: string) => {
    setEditingComment({ itemId, commentId, text });
  };

  const handleEditCommentSubmit = async (type: string) => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error('Comment must have characters');
      return;
    }
    setEditCommentLoading(editingComment.commentId);
    try {
      let url = '';
      if (type === 'event') url = `/events/${editingComment.itemId}/comment/${editingComment.commentId}`;
      if (type === 'post') url = `/notes/${editingComment.itemId}/comment/${editingComment.commentId}`;
      if (type === 'club') url = `/clubs/${editingComment.itemId}/comment/${editingComment.commentId}`;
      if (type === 'sell') url = `/sell-and-buy/${editingComment.itemId}/comment/${editingComment.commentId}`;
      if (type === 'lost') url = `/lost-and-found/${editingComment.itemId}/comment/${editingComment.commentId}`;
      await api.put(url, {
        text: editingComment.text.trim(),
        userId: user?.id
      });
      // Refetch data for the type
      if (type === 'event') fetchAllEvents();
      if (type === 'post') fetchNotes();
      if (type === 'club') fetchAllClubs();
      if (type === 'sell') fetchSellAndBuy();
      if (type === 'lost') fetchLostAndFound();
      setEditingComment(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setEditCommentLoading(null);
    }
  };

  const handleDeleteComment = async (type: string, itemId: string, commentId: string) => {
    setDeleteCommentLoading(commentId);
    try {
      let url = '';
      if (type === 'event') url = `/events/${itemId}/comment/${commentId}`;
      if (type === 'post') url = `/notes/${itemId}/comment/${commentId}`;
      if (type === 'club') url = `/clubs/${itemId}/comment/${commentId}`;
      if (type === 'sell') url = `/sell-and-buy/${itemId}/comment/${commentId}`;
      if (type === 'lost') url = `/lost-and-found/${itemId}/comment/${commentId}`;
      await api.delete(url, { data: { userId: user?.id } });
      // Refetch data for the type
      if (type === 'event') fetchAllEvents();
      if (type === 'post') fetchNotes();
      if (type === 'club') fetchAllClubs();
      if (type === 'sell') fetchSellAndBuy();
      if (type === 'lost') fetchLostAndFound();
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [] = useState(false);
  const [] = useState<Note | null>(null);
  const [lostAndFound, setLostAndFound] = useState<any[]>([]);
  const [sellAndBuy, setSellAndBuy] = useState<any[]>([]);
  const [] = useState({
    title: '',
    content: ''
  });
  const [modalImage, setModalImage] = useState<string | null>(null);


  useEffect(() => {
    fetchNotes();
    fetchAllEvents();
    fetchAllClubs();
    fetchLostAndFound();
    fetchSellAndBuy();
  }, []);
  // Fetch all lost and found items
  const fetchLostAndFound = async () => {
    try {
      const res = await api.get('/lost-and-found');
      setLostAndFound(res.data);
    } catch {
      setLostAndFound([]);
    }
  };

  // Fetch all sell and buy items
  const fetchSellAndBuy = async () => {
    try {
      const res = await api.get('/sell-and-buy');
      setSellAndBuy(res.data);
    } catch {
      setSellAndBuy([]);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as any).response?.status === 401
      ) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/signin');
      } else {
        toast.error('Failed to load notes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all events (not just user's)
  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      setEvents([]);
    }
  };

  // Fetch all clubs (not just user's)
  const fetchAllClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(response.data);
    } catch (error) {
      setClubs([]);
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
      {/* Modal for enlarged image */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setModalImage(null)}>
          <div className="flex flex-col items-center mt-20">
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
      <MainHeader title="Student Hub" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Events Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center mt-16">All Events</h2>
          {events.length === 0 ? (
            <div className="text-gray-500">No events available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map(event => {
                const isExpired = event.date && new Date(event.date) < new Date();
                return (
                  <div
                    key={event._id}
                    className={`rounded-lg shadow-sm border border-gray-200 p-6 ${isExpired ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}
                  >
                    {isExpired && (
                      <div className="mb-2 text-lg font-bold text-red-500 uppercase">Expired</div>
                    )}
                  {event.photoUrl && (
                    <img
                      src={event.photoUrl}
                      alt={event.title}
                      className="w-full max-h-64 object-contain rounded mb-2 border bg-gray-100 cursor-pointer"
                      style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                      onClick={() => setModalImage(event.photoUrl || null)}
                    />
                  )}
                  <div className="mb-1"><span className="font-semibold">Title:</span> {event.title}</div>
                  <div className="mb-1"><span className="font-semibold">Description:</span> {event.description}</div>
                  <div className="mb-1"><span className="font-semibold">Date:</span> {event.date ? new Date(event.date).toLocaleDateString() : ''}</div>
                  <div className="mb-1"><span className="font-semibold">Time:</span> {event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  <div className="mb-1"><span className="font-semibold">Branch:</span> {event.branch}</div>
                  <div className="mb-1"><span className="font-semibold">Location:</span> {event.location}</div>
                  {event.registrationLink && <div className="mb-1"><span className="font-semibold">Registration Link:</span> <a href={event.registrationLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{event.registrationLink}</a></div>}
                  {event.contactNo && <div className="mb-1"><span className="font-semibold">Contact No:</span> {event.contactNo}</div>}
                  {event.coordinatorName1 && <div className="mb-1"><span className="font-semibold">Coordinator 1:</span> {event.coordinatorName1}</div>}
                  {event.coordinatorName2 && <div className="mb-1"><span className="font-semibold">Coordinator 2:</span> {event.coordinatorName2}</div>}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={likeLoading === event._id}
                        onClick={() => handleLike('event', event._id, Array.isArray(event.likes) && event.likes.includes(user?.id))}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${Array.isArray(event.likes) && event.likes.includes(user?.id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} hover:bg-red-200 hover:text-red-700`}
                        title={Array.isArray(event.likes) && event.likes.includes(user?.id) ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-5 h-5 ${Array.isArray(event.likes) && event.likes.includes(user?.id) ? 'fill-red-600' : ''}`} fill={Array.isArray(event.likes) && event.likes.includes(user?.id) ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{event.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComments(event._id)}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[event._id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                        title={openComments[event._id] ? 'Hide Comments' : 'Show Comments'}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{event.comments?.length || 0}</span>
                    </div>
                  </div>
                  {/* Comments section */}
                  {openComments[event._id] && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                      <div className="space-y-2 mb-2">
                        {event.comments && event.comments.length > 0 ? (
                          event.comments.map((comment: any, idx: number) => {
                            const isAuthor = user?.id && comment.userId === user.id;
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.itemId === event._id;
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
                                          onClick={() => handleEditCommentSubmit('event')}
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
                                          onClick={() => handleEditComment(event._id, comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment('event', event._id, comment._id)}
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
                          value={commentInputs[event._id] || ''}
                          onChange={e => handleCommentInput(event._id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a comment..."
                          disabled={commentLoading === event._id}
                        />
                        <button
                          onClick={() => handleAddComment('event', event._id)}
                          disabled={commentLoading === event._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {commentLoading === event._id ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Posts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">All Posts</h2>
          {notes.length === 0 ? (
            <div className="text-gray-500">No posts available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notes.map(note => (
                <div key={note.id || ''} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {note.photoUrl && (
                    <img
                      src={note.photoUrl}
                      alt={note.title}
                      className="w-full max-h-64 object-contain rounded mb-2 border bg-gray-100 cursor-pointer"
                      style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                      onClick={() => setModalImage(note.photoUrl || null)}
                    />
                  )}
                  <div className="mb-1"><span className="font-semibold">Title:</span> {note.title}</div>
                  <div className="mb-1"><span className="font-semibold">Content:</span> {note.content}</div>
                  <div className="mb-1"><span className="font-semibold">Created At:</span> {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={likeLoading === (note.id || '')}
                        onClick={() => handleLike('post', note.id || '', Array.isArray(note.likes) && note.likes.includes(user?.id ?? ''))}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${Array.isArray(note.likes) && note.likes.includes(user?.id ?? '') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} hover:bg-red-200 hover:text-red-700`}
                        title={Array.isArray(note.likes) && note.likes.includes(user?.id ?? '') ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-5 h-5 ${Array.isArray(note.likes) && note.likes.includes(user?.id ?? '') ? 'fill-red-600' : ''}`} fill={Array.isArray(note.likes) && note.likes.includes(user?.id ?? '') ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{note.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComments(note.id || '')}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[note.id || ''] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                        title={openComments[note.id || ''] ? 'Hide Comments' : 'Show Comments'}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{note.comments?.length || 0}</span>
                    </div>
                  </div>
                  {/* Comments section */}
                  {openComments[note.id || ''] && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                      <div className="space-y-2 mb-2">
                        {note.comments && note.comments.length > 0 ? (
                          note.comments.map((comment: any, idx: number) => {
                            const isAuthor = user?.id && comment.userId === user.id;
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.itemId === (note.id || '');
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
                                          onClick={() => handleEditCommentSubmit('post')}
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
                                          onClick={() => handleEditComment(note.id || '', comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment('post', note.id || '', comment._id)}
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
                          value={commentInputs[note.id || ''] || ''}
                          onChange={e => handleCommentInput(note.id || '', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a comment..."
                          disabled={commentLoading === (note.id || '')}
                        />
                        <button
                          onClick={() => handleAddComment('post', note.id || '')}
                          disabled={commentLoading === (note.id || '')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {commentLoading === (note.id || '') ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Clubs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">All Clubs</h2>
          {clubs.length === 0 ? (
            <div className="text-gray-500">No clubs available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map(club => (
                <div key={club._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {club.photoUrl && (
                    <img
                      src={club.photoUrl}
                      alt={club.name}
                      className="w-full max-h-64 object-contain rounded mb-2 border bg-gray-100 cursor-pointer"
                      style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                      onClick={() => setModalImage(club.photoUrl || null)}
                    />
                  )}
                  <div className="mb-1"><span className="font-semibold">Name:</span> {club.name}</div>
                  <div className="mb-1"><span className="font-semibold">Description:</span> {club.description}</div>
                  {club.allowedYears && club.allowedYears.length > 0 && (
                    <div className="mb-1"><span className="font-semibold">Allowed Years:</span> {club.allowedYears.join(', ')}</div>
                  )}
                  {club.presidentName && (
                    <div className="mb-1"><span className="font-semibold">President:</span> {club.presidentName}</div>
                  )}
                  {club.contactNo && (
                    <div className="mb-1"><span className="font-semibold">Contact No:</span> {club.contactNo}</div>
                  )}
                  {club.whatsappGroupLink && (
                    <div className="mb-1"><span className="font-semibold">WhatsApp Group Link:</span> <a href={club.whatsappGroupLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join</a></div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={likeLoading === club._id}
                        onClick={() => handleLike('club', club._id, Array.isArray(club.likes) && club.likes.includes(user?.id))}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${Array.isArray(club.likes) && club.likes.includes(user?.id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} hover:bg-red-200 hover:text-red-700`}
                        title={Array.isArray(club.likes) && club.likes.includes(user?.id) ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-5 h-5 ${Array.isArray(club.likes) && club.likes.includes(user?.id) ? 'fill-red-600' : ''}`} fill={Array.isArray(club.likes) && club.likes.includes(user?.id) ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{club.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComments(club._id)}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[club._id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                        title={openComments[club._id] ? 'Hide Comments' : 'Show Comments'}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{club.comments?.length || 0}</span>
                    </div>
                  </div>
                  {/* Comments section */}
                  {openComments[club._id] && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                      <div className="space-y-2 mb-2">
                        {club.comments && club.comments.length > 0 ? (
                          club.comments.map((comment: any, idx: number) => {
                            const isAuthor = user?.id && comment.userId === user.id;
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.itemId === club._id;
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
                                          onClick={() => handleEditCommentSubmit('club')}
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
                                          onClick={() => handleEditComment(club._id, comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment('club', club._id, comment._id)}
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
                          value={commentInputs[club._id] || ''}
                          onChange={e => handleCommentInput(club._id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a comment..."
                          disabled={commentLoading === club._id}
                        />
                        <button
                          onClick={() => handleAddComment('club', club._id)}
                          disabled={commentLoading === club._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {commentLoading === club._id ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lost & Found Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">All Lost & Found Items</h2>
          {lostAndFound.length === 0 ? (
            <div className="text-gray-500">No lost & found items available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lostAndFound.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm p-6">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      className="w-full max-h-64 object-contain rounded mb-2 bg-gray-100 cursor-pointer"
                      style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                      onClick={() => setModalImage(item.photoUrl || null)}
                    />
                  )}
                  <div className="mb-1"><span className="font-semibold">Item Name:</span> {item.itemName}</div>
                  <div className="mb-1"><span className="font-semibold">Description:</span> {item.description}</div>
                  <div className="mb-1"><span className="font-semibold">Location:</span> {item.location}</div>
                  <div className="mb-1"><span className="font-semibold">Date Lost:</span> {item.dateLost ? new Date(item.dateLost).toLocaleDateString() : ''}</div>
                  <div className="mb-1"><span className="font-semibold">Contact:</span> {item.contactInfo}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComments(item._id)}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[item._id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                        title={openComments[item._id] ? 'Hide Comments' : 'Show Comments'}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{item.comments?.length || 0}</span>
                    </div>
                  </div>
                  {/* Comments section */}
                  {openComments[item._id] && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                      <div className="space-y-2 mb-2">
                        {item.comments && item.comments.length > 0 ? (
                          item.comments.map((comment: any, idx: number) => {
                            const isAuthor = user?.id && comment.userId === user.id;
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.itemId === item._id;
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
                                          onClick={() => handleEditCommentSubmit('lost')}
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
                                          onClick={() => handleEditComment(item._id, comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment('lost', item._id, comment._id)}
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
                          value={commentInputs[item._id] || ''}
                          onChange={e => handleCommentInput(item._id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a comment..."
                          disabled={commentLoading === item._id}
                        />
                        <button
                          onClick={() => handleAddComment('lost', item._id)}
                          disabled={commentLoading === item._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {commentLoading === item._id ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sell & Buy Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">All Sell & Buy Items</h2>
          {sellAndBuy.length === 0 ? (
            <div className="text-gray-500">No sell & buy items available.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sellAndBuy.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm p-6">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      className="w-full max-h-64 object-contain rounded mb-2 bg-gray-100 cursor-pointer"
                      style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                      onClick={() => setModalImage(item.photoUrl || null)}
                    />
                  )}
                  <div className="mb-1"><span className="font-semibold">Item Name:</span> {item.itemName}</div>
                  <div className="mb-1"><span className="font-semibold">Description:</span> {item.description}</div>
                  <div className="mb-1"><span className="font-semibold">Price:</span> ₹{item.price}</div>
                  <div className="mb-1"><span className="font-semibold">Contact:</span> {item.contactInfo}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={likeLoading === item._id}
                        onClick={() => handleLike('sell', item._id, Array.isArray(item.likes) && item.likes.includes(user?.id))}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${Array.isArray(item.likes) && item.likes.includes(user?.id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} hover:bg-red-200 hover:text-red-700`}
                        title={Array.isArray(item.likes) && item.likes.includes(user?.id) ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-5 h-5 ${Array.isArray(item.likes) && item.likes.includes(user?.id) ? 'fill-red-600' : ''}`} fill={Array.isArray(item.likes) && item.likes.includes(user?.id) ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{item.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComments(item._id)}
                        className={`p-2 rounded-full transition-colors duration-200 flex items-center ${openComments[item._id] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} hover:bg-blue-200 hover:text-blue-700`}
                        title={openComments[item._id] ? 'Hide Comments' : 'Show Comments'}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{item.comments?.length || 0}</span>
                    </div>
                  </div>
                  {/* Comments section */}
                  {openComments[item._id] && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
                      <div className="space-y-2 mb-2">
                        {item.comments && item.comments.length > 0 ? (
                          item.comments.map((comment: any, idx: number) => {
                            const isAuthor = user?.id && comment.userId === user.id;
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.itemId === item._id;
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
                                          onClick={() => handleEditCommentSubmit('sell')}
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
                                          onClick={() => handleEditComment(item._id, comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment('sell', item._id, comment._id)}
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
                          value={commentInputs[item._id] || ''}
                          onChange={e => handleCommentInput(item._id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a comment..."
                          disabled={commentLoading === item._id}
                        />
                        <button
                          onClick={() => handleAddComment('sell', item._id)}
                          disabled={commentLoading === item._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {commentLoading === item._id ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default Dashboard;