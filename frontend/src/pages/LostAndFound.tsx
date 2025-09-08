import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MainHeader from '../components/MainHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import { Edit3, Trash2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LostAndFound: React.FC = () => {
  const [showMyItems, setShowMyItems] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({
    itemName: '',
    description: '',
    location: '',
    dateLost: '',
    contact: '',
    photo: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(form);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<{ [itemId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [itemId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ itemId: string; commentId: string; text: string } | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null);
  const handleToggleComments = (itemId: string) => {
    setOpenComments(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleCommentInput = (itemId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [itemId]: value }));
  };

  const handleAddComment = async (itemId: string) => {
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
      const response = await api.post(`/lost-and-found/${itemId}/comment`, {
        text,
        userId: user.id,
        userName: user.fullName
      });
      setItems(prev => prev.map(item => item._id === itemId ? { ...item, comments: response.data.comments } : item));
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

  const handleEditCommentSubmit = async () => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error('Comment must have characters');
      return;
    }
    setEditCommentLoading(editingComment.commentId);
    try {
      const response = await api.put(`/lost-and-found/${editingComment.itemId}/comment/${editingComment.commentId}`, {
        text: editingComment.text.trim(),
        userId: user?.id
      });
      setItems(prev => prev.map(item => item._id === editingComment.itemId ? { ...item, comments: response.data.comments } : item));
      setEditingComment(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setEditCommentLoading(null);
    }
  };

  const handleDeleteComment = async (itemId: string, commentId: string) => {
    setDeleteCommentLoading(commentId);
    try {
      if (!user?.id) {
        toast.error('Login to delete comment');
        setDeleteCommentLoading(null);
        return;
      }
      const response = await api.delete(`/lost-and-found/${itemId}/comment/${commentId}`, { data: { userId: user.id } });
      setItems(prev => prev.map(item => item._id === itemId ? { ...item, comments: response.data.comments } : item));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/lost-and-found');
      setItems(res.data);
    } catch {
      setItems([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('itemName', form.itemName);
      data.append('description', form.description);
      data.append('location', form.location);
      data.append('dateLost', form.dateLost);
      data.append('contactInfo', form.contact);
      data.append('createdBy', user?.id || 'anonymous');
      if (form.photo) data.append('photo', form.photo);
      await api.post('/lost-and-found', data);
      setForm({ itemName: '', description: '', location: '', dateLost: '', contact: '', photo: null });
      fetchItems();
      toast.success('Lost & Found item submitted!', { duration: 4000 });
    } catch (error) {
      toast.error('Error submitting item.', { duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setEditForm({
      itemName: item.itemName,
      description: item.description,
      location: item.location,
      dateLost: item.dateLost?.slice(0, 10) || '',
      contact: item.contactInfo,
      photo: null,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/lost-and-found/${editingId}`, {
        itemName: editForm.itemName,
        description: editForm.description,
        location: editForm.location,
        dateLost: editForm.dateLost,
        contactInfo: editForm.contact,
      });
      setEditingId(null);
      fetchItems();
      toast.success('Item updated successfully!', { duration: 4000 });
    } catch {
      toast.error('Error updating item.', { duration: 4000 });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/lost-and-found/${id}`);
      fetchItems();
      toast.success('Item deleted successfully!', { duration: 4000 });
    } catch {
      toast.error('Error deleting item.', { duration: 4000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating My Lost & Found button at top right of viewport */}
      <button
        onClick={() => setShowMyItems((prev) => !prev)}
        className="fixed top-20 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
        style={{ minWidth: '140px' }}
      >
        My Items
      </button>
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
      {/* My Lost & Found Modal */}
      {showMyItems && (
        <div className="fixed top-0 left-0 w-full h-full z-50" onClick={() => setShowMyItems(false)}>
          <div className="absolute top-20 right-8 bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg border border-gray-200 overflow-y-auto" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">My Lost & Found Items</h2>
            {items.filter(item => item.createdBy === user?.id).length === 0 ? (
              <p className="text-gray-500">You haven't reported any items yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {items.filter(item => item.createdBy === user?.id).map(item => (
                  <div key={item._id} className="bg-white shadow rounded-lg p-6 flex flex-col gap-2 relative">
                    {/* Edit/Delete buttons at top right */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-bold text-blue-700 mb-1 text-lg">{item.itemName}</div>
                    <div className="mb-1 text-gray-600">Location: <span className="font-normal">{item.location}</span></div>
                    <div className="mb-1 text-gray-600">Date Lost: <span className="font-normal">{item.dateLost ? new Date(item.dateLost).toLocaleDateString() : ''}</span></div>
                    <div className="mb-1 text-gray-600">Contact: <span className="font-normal">{item.contactInfo}</span></div>
                    <div className="mb-2 text-gray-700">Description: <span className="font-normal">{item.description}</span></div>
                    {item.photoUrl && (
                      <img src={item.photoUrl} alt={item.itemName} className="max-w-xs rounded mb-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <MainHeader title="Lost & Found" />
      <div className="mt-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Lost & Found Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required className="w-full" />
            <Input name="photo" type="file" onChange={handlePhotoChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm" required />
            <Input name="location" placeholder="Location Lost/Found" value={form.location} onChange={handleChange} required className="w-full" />
            <Input name="dateLost" type="date" placeholder="Date Lost/Found" value={form.dateLost ? form.dateLost.split('T')[0] : ''} onChange={handleChange} required className="w-full" />
            <Input name="contact" placeholder="Contact Info" value={form.contact} onChange={handleChange} required className="w-full" />
            <Button type="submit" isLoading={submitting}>Submit</Button>
          </form>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Lost & Found Items</h2>
        {items.length === 0 ? (
          <div className="text-gray-500">No items found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <React.Fragment key={item._id}>
                <div className="rounded-lg p-4 shadow-sm relative flex flex-col bg-white">
                  {editingId === item._id ? (
                    <form onSubmit={handleUpdate} className="space-y-2">
                      <Input name="itemName" value={editForm.itemName} onChange={handleEditChange} required />
                      <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={2} className="block w-full px-3 py-2 border rounded" required />
                      <Input name="location" value={editForm.location} onChange={handleEditChange} required />
                      <Input name="dateLost" type="date" value={editForm.dateLost ? editForm.dateLost.split('T')[0] : ''} onChange={handleEditChange} required />
                      <Input name="contact" value={editForm.contact} onChange={handleEditChange} required />
                      <div className="flex gap-2 mt-2">
                        <Button type="submit">Save</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-black line-clamp-2">{item.itemName}</h3>
                        {item.createdBy === user?.id && (
                          <div className="flex space-x-1 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {item.photoUrl && (
                        <img
                          src={item.photoUrl}
                          alt={item.itemName}
                          className="w-full max-h-64 object-contain rounded mb-2 bg-gray-100 cursor-pointer"
                          style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                          onClick={() => setModalImage(item.photoUrl || null)}
                        />
                      )}
                      <div className="mb-1 text-gray-600">Location: <span className="font-normal">{item.location}</span></div>
                      <div className="mb-1 text-gray-600">Date Lost: <span className="font-normal">{item.dateLost ? new Date(item.dateLost).toLocaleDateString() : ''}</span></div>
                      <div className="mb-1 text-gray-600">Contact: <span className="font-normal">{item.contactInfo}</span></div>
                      <div className="mb-2 text-gray-700">Description: <span className="font-normal">{item.description}</span></div>
                      {/* Comment button and section */}
                      <div className="flex items-center gap-4 mt-4">
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
                      {/* Comments section for main grid */}
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
                                              onClick={() => handleEditComment(item._id, comment._id, comment.text)}
                                              className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                              title="Edit Comment"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(item._id, comment._id)}
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
                              onClick={() => handleAddComment(item._id)}
                              disabled={commentLoading === item._id}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {commentLoading === item._id ? 'Posting...' : 'Comment'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostAndFound;