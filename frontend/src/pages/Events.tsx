import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import eventsAPI from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Edit3, Trash2, Heart, MessageCircle } from 'lucide-react';
import MainHeader from '../components/MainHeader';
import Button from '../components/Button';
import Input from '../components/Input';



export interface EventComment {
  _id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  branch: string;
  photoUrl?: string;
  createdBy: string;
  registrationLink?: string;
  contactNo?: string;
  coordinatorName1?: string;
  coordinatorName2?: string;
  likes?: string[];
  comments?: EventComment[];
}

const Events: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [openComments, setOpenComments] = useState<{ [eventId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [eventId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ eventId: string; commentId: string; text: string } | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const handleToggleComments = (eventId: string) => {
    setOpenComments(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleCommentInput = (eventId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [eventId]: value }));
  };

  const handleAddComment = async (eventId: string) => {
    const text = commentInputs[eventId]?.trim();
    if (!user?.id) {
      toast.error('Login to comment');
      return;
    }
    if (!text) {
      toast.error('Comment cannot be empty');
      return;
    }
    setCommentLoading(eventId);
    try {
      const response = await eventsAPI.post(`/events/${eventId}/comment`, {
        text,
        userId: user.id,
        userName: user.fullName
      });
      setEvents(prev => prev.map(event => event._id === eventId ? { ...event, comments: response.data.comments } : event));
      setCommentInputs(prev => ({ ...prev, [eventId]: '' }));
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(null);
    }
  };

  const handleEditComment = (eventId: string, commentId: string, text: string) => {
    setEditingComment({ eventId, commentId, text });
  };

  const handleEditCommentSubmit = async () => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error('Comment must have characters');
      return;
    }
    setEditCommentLoading(editingComment.commentId);
    try {
      const response = await eventsAPI.put(`/events/${editingComment.eventId}/comment/${editingComment.commentId}`, {
        text: editingComment.text.trim(),
        userId: user?.id
      });
      setEvents(prev => prev.map(event => event._id === editingComment.eventId ? { ...event, comments: response.data.comments } : event));
      setEditingComment(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setEditCommentLoading(null);
    }
  };

  const handleDeleteComment = async (eventId: string, commentId: string) => {
    if (!user?.id) {
      toast.error('Login to delete comments');
      return;
    }
    setDeleteCommentLoading(commentId);
    try {
      const response = await eventsAPI.delete(`/events/${eventId}/comment/${commentId}`, { data: { userId: user.id } });
      setEvents(prev => prev.map(event => event._id === eventId ? { ...event, comments: response.data.comments } : event));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };

  const handleLike = async (eventId: string, liked: boolean) => {
    if (!user?.id) {
      toast.error('Login to like events');
      return;
    }
    setLikeLoading(eventId);
    try {
      if (liked) {
        await eventsAPI.post(`/events/${eventId}/unlike`, { userId: user.id });
        setEvents(prev => prev.map(event => event._id === eventId ? { ...event, likes: Array.isArray(event.likes) ? event.likes.filter(uid => uid !== user.id) : [] } : event));
        toast.success('Unliked event');
      } else {
        await eventsAPI.post(`/events/${eventId}/like`, { userId: user.id });
        setEvents(prev => prev.map(event => event._id === eventId ? { ...event, likes: Array.isArray(event.likes) ? [...event.likes, user.id] : [user.id] } : event));
        toast.success('Liked event');
      }
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(null);
    }
  };
  const [] = useState(0);
  const [, setLoading] = useState(true);
  const [, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    branch: '',
    photo: null as File | null,
    registrationLink: '',
    contactNo: '',
    coordinatorName1: '',
    coordinatorName2: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.get('/events');
      // Sort by date descending
      const sorted = [...res.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(sorted);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log('File selected:', e.target.files[0]);
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    } else {
      console.log('No file selected in input');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('date', formData.date + (formData.time ? 'T' + formData.time : ''));
      data.append('location', formData.location);
      data.append('branch', formData.branch);
      data.append('createdBy', user?.id || '');
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      data.append('registrationLink', formData.registrationLink);
      data.append('contactNo', formData.contactNo);
      data.append('coordinatorName1', formData.coordinatorName1);
      data.append('coordinatorName2', formData.coordinatorName2);
      if (editingEvent) {
        await eventsAPI.put(`/events/${editingEvent._id}`, data);
        toast.success('Event updated successfully!', { duration: 2000 });
      } else {
        await eventsAPI.post('/events', data);
        toast.success('Event created successfully!', { duration: 2000 });
      }
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        branch: '',
        photo: null,
        registrationLink: '',
        contactNo: '',
        coordinatorName1: '',
        coordinatorName2: '',
      });
      fetchEvents();
    } catch (err) {
      toast.error('Error saving event.', { duration: 2000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: '',
      location: event.location,
      branch: event.branch,
      photo: null,
      registrationLink: event.registrationLink || '',
      contactNo: event.contactNo || '',
      coordinatorName1: event.coordinatorName1 || '',
      coordinatorName2: event.coordinatorName2 || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsAPI.delete(`/events/${id}`);
  toast.success('Event deleted successfully!', { duration: 2000 });
      fetchEvents();
    } catch {
  toast.error('Error deleting event.', { duration: 2000 });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // My Events
  const myEvents = events.filter(event => String(event.createdBy) === String(user?.id));

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
      <MainHeader title="Events" />
      <div className="mt-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="title" placeholder="Event Title" value={formData.title} onChange={handleInputChange} required />
            <Input name="branch" placeholder="Branch" value={formData.branch} onChange={handleInputChange} required />
            <Input name="date" type="date" placeholder="Date" value={formData.date} onChange={handleInputChange} required />
            <Input name="time" type="time" placeholder="Time" value={formData.time} onChange={handleInputChange} required />
            <Input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
            <Input name="registrationLink" placeholder="Registration Link" value={formData.registrationLink} onChange={handleInputChange} />
            <Input name="contactNo" placeholder="Contact Number" value={formData.contactNo} onChange={handleInputChange} />
            <Input name="coordinatorName1" placeholder="Coordinator 1" value={formData.coordinatorName1} onChange={handleInputChange} />
            <Input name="coordinatorName2" placeholder="Coordinator 2" value={formData.coordinatorName2} onChange={handleInputChange} />
            <Input name="photo" type="file" onChange={handlePhotoChange} className="col-span-2" />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows={3} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm col-span-2" required />
            <div className="flex gap-2 col-span-2">
              <Button type="submit" isLoading={submitting}>{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
              <Button type="button" variant="outline" onClick={() => { setEditingEvent(null); setFormData({ title: '', description: '', date: '', time: '', location: '', branch: '', photo: null, registrationLink: '', contactNo: '', coordinatorName1: '', coordinatorName2: '' }); }}>Cancel</Button>
            </div>
          </form>
        </div>
        {/* Floating My Events button at top right of viewport */}
        <button
          onClick={() => setShowMyEvents((prev) => !prev)}
          className="fixed top-20 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
          style={{ minWidth: '120px' }}
        >
          My Events
        </button>
        {/* My Events Modal */}
        {showMyEvents && (
          <div className="fixed top-0 left-0 w-full h-full z-50" onClick={() => setShowMyEvents(false)}>
            <div className="absolute top-20 right-8 bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg border border-gray-200 overflow-y-auto" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-blue-700">My Events</h2>
              {myEvents.length === 0 ? (
                <p className="text-gray-500">You haven't created any events yet.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {myEvents.map(event => {
                    const isExpired = event.date && new Date(event.date) < new Date();
                    return (
                      <div
                        key={event._id}
                        className={`shadow rounded-lg p-6 flex flex-col gap-2 relative ${isExpired ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}
                      >
                        {isExpired && (
                          <div className="mb-2 text-lg font-bold text-red-500 uppercase">Expired</div>
                        )}
                      {/* Edit/Delete buttons at top right */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold text-blue-700 mb-1">Title: <span className="font-normal text-gray-900">{event.title}</span></div>
                      <div className="mb-1 text-gray-600">Date: <span className="font-normal">{new Date(event.date).toLocaleDateString()}</span> | Time: <span className="font-normal">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div className="mb-1 text-gray-600">Branch: <span className="font-normal">{event.branch}</span></div>
                      <div className="mb-1 text-gray-600">Location: <span className="font-normal">{event.location}</span></div>
                      <div className="mb-2 text-gray-700">Description: <span className="font-normal">{event.description}</span></div>
                      {event.registrationLink && (
                        <div className="mb-1 text-gray-600">Registration: <a href={/^https?:\/\//.test(event.registrationLink) ? event.registrationLink : `https://${event.registrationLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{event.registrationLink}</a></div>
                      )}
                      {event.contactNo && (
                        <div className="mb-1 text-gray-600">Contact No: <span className="font-normal">{event.contactNo}</span></div>
                      )}
                      {event.coordinatorName1 && (
                        <div className="mb-1 text-gray-600">Coordinator 1: <span className="font-normal">{event.coordinatorName1}</span></div>
                      )}
                      {event.coordinatorName2 && (
                        <div className="mb-1 text-gray-600">Coordinator 2: <span className="font-normal">{event.coordinatorName2}</span></div>
                      )}
                      {event.photoUrl && (
                        <img src={event.photoUrl} alt={event.title} className="max-w-xs rounded mb-2" />
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Events</h2>
        {events.length === 0 ? (
          <div className="text-gray-500 mt-8">No events available.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => {
              const isExpired = event.date && new Date(event.date) < new Date();
              return (
                <div
                  key={event._id}
                  className={`shadow rounded p-6 flex flex-col relative ${isExpired ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}
                >
                  {isExpired && (
                    <div className="mb-2 text-lg font-bold text-red-500 uppercase">Expired</div>
                  )}
                <div className="flex items-start justify-between mb-3">
                  <strong className="text-xl text-black mb-2">{event.title}</strong>
                  {event.createdBy === user?.id && (
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {event.photoUrl && (
                  <img
                    src={event.photoUrl}
                    alt={event.title}
                    className="w-full max-h-64 object-contain rounded mb-2 bg-gray-100 cursor-pointer"
                    style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                    onClick={() => setModalImage(event.photoUrl || null)}
                  />
                )}
                <div className="mb-2 text-gray-700 break-words max-w-full"><span className="font-semibold">Description:</span> {event.description}</div>
                <div className="mb-2 text-gray-600">Date: <span className="font-semibold">{new Date(event.date).toLocaleDateString()}</span> | Time: <span className="font-semibold">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="mb-2 text-gray-600">Branch: <span className="font-semibold">{event.branch}</span></div>
                <div className="mb-2 text-gray-600">Location: <span className="font-semibold">{event.location}</span></div>
                {event.registrationLink && (
                  <div className="mb-2 text-gray-600">Registration: <a href={/^https?:\/\//.test(event.registrationLink) ? event.registrationLink : `https://${event.registrationLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{event.registrationLink}</a></div>
                )}
                {event.contactNo && (
                  <div className="mb-2 text-gray-600">Contact No: <span className="font-semibold">{event.contactNo}</span></div>
                )}
                {event.coordinatorName1 && (
                  <div className="mb-2 text-gray-600">Coordinator 1: <span className="font-semibold">{event.coordinatorName1}</span></div>
                )}
                {event.coordinatorName2 && (
                  <div className="mb-2 text-gray-600">Coordinator 2: <span className="font-semibold">{event.coordinatorName2}</span></div>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={likeLoading === event._id}
                      onClick={() => handleLike(event._id, Array.isArray(event.likes) && event.likes.includes(user?.id))}
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
                        event.comments.map((comment: { userId: string; _id: string | null; userName: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; text: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; }, idx: any) => {
                          const isAuthor = user?.id && comment.userId === user.id;
                          const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.eventId === event._id;
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
                                        onClick={() => handleEditComment(event._id, String(comment._id ?? ''), String(comment.text))}
                                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                        title="Edit Comment"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(event._id, comment._id ?? '')}
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
                        onClick={() => handleAddComment(event._id)}
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
    </div>
  );
};

export default Events;
