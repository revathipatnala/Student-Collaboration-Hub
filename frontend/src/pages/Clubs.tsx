import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import clubsAPI from '../services/api';
import MainHeader from '../components/MainHeader';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import { Edit3, Trash2, Heart, MessageCircle } from 'lucide-react';

const Clubs: React.FC = () => {
  const [showMyClubs, setShowMyClubs] = useState(false);
  const { user } = useAuth();
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [openComments, setOpenComments] = useState<{ [clubId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [clubId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ clubId: string; commentId: string; text: string } | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const handleToggleComments = (clubId: string) => {
    setOpenComments(prev => ({ ...prev, [clubId]: !prev[clubId] }));
  };

  const handleCommentInput = (clubId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [clubId]: value }));
  };

  const handleAddComment = async (clubId: string) => {
    const text = commentInputs[clubId]?.trim();
    if (!user?.id) {
      toast.error('Login to comment');
      return;
    }
    if (!text) {
      toast.error('Comment cannot be empty');
      return;
    }
    setCommentLoading(clubId);
    try {
      const response = await clubsAPI.post(`/clubs/${clubId}/comment`, {
        text,
        userId: user.id,
        userName: user.fullName
      });
      setClubs(prev => prev.map(club => club._id === clubId ? { ...club, comments: response.data.comments } : club));
      setCommentInputs(prev => ({ ...prev, [clubId]: '' }));
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(null);
    }
  };

  const handleEditComment = (clubId: string, commentId: string, text: string) => {
    setEditingComment({ clubId, commentId, text });
  };

  const handleEditCommentSubmit = async () => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error('Comment must have characters');
      return;
    }
    setEditCommentLoading(editingComment.commentId);
    try {
      const response = await clubsAPI.put(`/clubs/${editingComment.clubId}/comment/${editingComment.commentId}`, {
        text: editingComment.text.trim(),
        userId: user?.id || ''
      });
      setClubs(prev => prev.map(club => club._id === editingComment.clubId ? { ...club, comments: response.data.comments } : club));
      setEditingComment(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setEditCommentLoading(null);
    }
  };

  const handleDeleteComment = async (clubId: string, commentId: string) => {
    if (!user?.id) {
      toast.error('Login to delete comments');
      return;
    }
    setDeleteCommentLoading(commentId);
    try {
      const response = await clubsAPI.delete(`/clubs/${clubId}/comment/${commentId}`, { data: { userId: user.id } });
      setClubs(prev => prev.map(club => club._id === clubId ? { ...club, comments: response.data.comments } : club));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteCommentLoading(null);
    }
  };

  const handleLike = async (clubId: string, liked: boolean) => {
    if (!user?.id) {
      toast.error('Login to like clubs');
      return;
    }
    setLikeLoading(clubId);
    try {
      if (liked) {
        await clubsAPI.post(`/clubs/${clubId}/unlike`, { userId: user.id });
        setClubs(prev => prev.map(club => club._id === clubId ? { ...club, likes: Array.isArray(club.likes) ? club.likes.filter((uid: string) => uid !== user.id) : [] } : club));
        toast.success('Unliked club');
      } else {
        await clubsAPI.post(`/clubs/${clubId}/like`, { userId: user.id });
        setClubs(prev => prev.map(club => club._id === clubId ? { ...club, likes: Array.isArray(club.likes) ? [...club.likes, user.id] : [user.id] } : club));
        toast.success('Liked club');
      }
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(null);
    }
  };
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allowedYears: [] as string[],
    whatsappGroupLink: '',
    presidentName: '',
    contactNo: '',
    photo: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // ✅ Reusable function to fetch clubs
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await clubsAPI.get('/clubs');
      setClubs(res.data);
    } catch (err) {
      setClubs([]);
      toast.error('Failed to fetch clubs', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clubs on component mount
  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('allowedYears', JSON.stringify(formData.allowedYears));
    data.append('whatsappGroupLink', formData.whatsappGroupLink);
    data.append('presidentName', formData.presidentName);
    data.append('contactNo', formData.contactNo);
    data.append('createdBy', user?.id || '');
    if (formData.photo) data.append('photo', formData.photo);

    try {
      if (editingClub) {
        await clubsAPI.put(`/clubs/${editingClub._id}`, data);
        toast.success('Club updated successfully!', { duration: 4000 });
      } else {
        await clubsAPI.post('/clubs', data);
        toast.success('Club created successfully!', { duration: 4000 });
      }

      // ✅ Refresh the clubs list
      fetchClubs();

      // Reset form
      setFormData({
        name: '',
        description: '',
        allowedYears: [],
        whatsappGroupLink: '',
        presidentName: '',
        contactNo: '',
        photo: null,
      });
      setEditingClub(null);
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error('Error saving club.', { duration: 4000 });
    }
  };

  const handleDelete = async (clubId: string) => {
    if (!window.confirm('Delete this club?')) return;

    try {
      await clubsAPI.delete(`/clubs/${clubId}`);
      toast.success('Club deleted successfully!', { duration: 4000 });
      // ✅ Refresh the list
      fetchClubs();
    } catch {
      toast.error('Error deleting club.', { duration: 4000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating My Clubs button */}
      <button
        onClick={() => setShowMyClubs((prev) => !prev)}
        className="fixed top-20 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
        style={{ minWidth: '120px' }}
      >
        My Clubs
      </button>

      {/* Modal for enlarged image */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setModalImage(null)}
        >
          <div className="flex flex-col items-center mt-20">
            <img
              src={modalImage}
              alt="Enlarged"
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border-4 border-white mb-4"
              style={{ objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition mb-2"
              onClick={(e) => {
                e.stopPropagation();
                if (modalImage) {
                  fetch(modalImage)
                    .then((response) => response.blob())
                    .then((blob) => {
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

      {/* My Clubs Modal */}
      {showMyClubs && (
        <div
          className="fixed top-0 left-0 w-full h-full z-50"
          onClick={() => setShowMyClubs(false)}
        >
          <div
            className="absolute top-20 right-8 bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg border border-gray-200 overflow-y-auto"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-blue-700">My Clubs</h2>
            {clubs.filter((club) => club.createdBy === user?.id).length === 0 ? (
              <p className="text-gray-500">You haven't created any clubs yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {clubs
                  .filter((club) => club.createdBy === user?.id)
                  .map((club) => (
                    <div
                      key={club._id}
                      className="bg-white shadow rounded-lg p-6 flex flex-col gap-2 relative"
                    >
                      {/* Edit/Delete buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingClub(club);
                            setFormData({
                              name: club.name,
                              description: club.description,
                              allowedYears: club.allowedYears || [],
                              whatsappGroupLink: club.whatsappGroupLink || '',
                              presidentName: club.presidentName || '',
                              contactNo: club.contactNo || '',
                              photo: null,
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(club._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold text-blue-700 mb-1">
                        Name: <span className="font-normal text-gray-900">{club.name}</span>
                      </div>
                      <div className="mb-2 text-gray-700">
                        Description: <span className="font-normal">{club.description}</span>
                      </div>
                      {club.allowedYears && club.allowedYears.length > 0 && (
                        <div className="mb-1 text-gray-600">
                          Allowed Years: <span className="font-normal">{club.allowedYears.join(', ')}</span>
                        </div>
                      )}
                      {club.presidentName && (
                        <div className="mb-1 text-gray-600">
                          President: <span className="font-normal">{club.presidentName}</span>
                        </div>
                      )}
                      {club.contactNo && (
                        <div className="mb-1 text-gray-600">
                          Contact No: <span className="font-normal">{club.contactNo}</span>
                        </div>
                      )}
                      {club.whatsappGroupLink && (
                        <div className="mb-1 text-gray-600">
                          WhatsApp Group Link:{' '}
                          <a
                            href={club.whatsappGroupLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            Join
                          </a>
                        </div>
                      )}
                      {club.photoUrl && (
                        <img src={club.photoUrl} alt={club.name} className="max-w-xs rounded mb-2" />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      <MainHeader title="Clubs" />
      <div className="mt-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create/Edit Club Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 w-full border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingClub ? 'Edit Club' : 'Create New Club'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Club Name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              name="photo"
              type="file"
              onChange={(e) =>
                setFormData((f) => ({ ...f, photo: e.target.files ? e.target.files[0] : null }))
              }
            />
            <Input
              name="presidentName"
              placeholder="President Name"
              value={formData.presidentName}
              onChange={(e) => setFormData((f) => ({ ...f, presidentName: e.target.value }))}
              required
            />
            <Input
              name="contactNo"
              placeholder="Contact Number"
              value={formData.contactNo}
              onChange={(e) => setFormData((f) => ({ ...f, contactNo: e.target.value }))}
              required
            />
            <Input
              name="whatsappGroupLink"
              placeholder="WhatsApp Group Link"
              value={formData.whatsappGroupLink}
              onChange={(e) =>
                setFormData((f) => ({ ...f, whatsappGroupLink: e.target.value }))
              }
            />
            <Input
              name="allowedYears"
              placeholder="Allowed Years (comma separated)"
              value={formData.allowedYears.join(', ')}
              onChange={(e) =>
                setFormData((f) => ({ ...f, allowedYears: e.target.value.split(',').map((y) => y.trim()) }))
              }
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" isLoading={submitting}>
                {editingClub ? 'Save Changes' : 'Create Club'}
              </Button>
              {editingClub && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingClub(null);
                    setFormData({
                      name: '',
                      description: '',
                      allowedYears: [],
                      whatsappGroupLink: '',
                      presidentName: '',
                      contactNo: '',
                      photo: null,
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Clubs Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Clubs</h2>
            <span className="text-sm text-gray-500">{clubs.length} clubs</span>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : clubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-500">Create your first club to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club: any) => (
                <div
                  key={club._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-black line-clamp-2">{club.name}</h3>
                    {club.createdBy === user?.id && (
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingClub(club);
                            setFormData({
                              name: club.name,
                              description: club.description,
                              allowedYears: club.allowedYears || [],
                              whatsappGroupLink: club.whatsappGroupLink || '',
                              presidentName: club.presidentName || '',
                              contactNo: club.contactNo || '',
                              photo: null,
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(club._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {club.photoUrl && (
                    <img
                      src={club.photoUrl}
                      alt={club.name}
                      className="w-full max-h-64 object-contain rounded mb-4 border bg-gray-100 cursor-pointer"
                      onClick={() => setModalImage(club.photoUrl || null)}
                    />
                  )}
                  <p className="text-gray-600 mb-4">{club.description}</p>
                  {club.allowedYears && club.allowedYears.length > 0 && (
                    <div className="mb-2 text-gray-600 text-sm">
                      Allowed Years: <span className="font-normal">{club.allowedYears.join(', ')}</span>
                    </div>
                  )}
                  {club.presidentName && (
                    <div className="mb-2 text-gray-600 text-sm">
                      President: <span className="font-normal">{club.presidentName}</span>
                    </div>
                  )}
                  {club.contactNo && (
                    <div className="mb-2 text-gray-600 text-sm">
                      Contact No: <span className="font-normal">{club.contactNo}</span>
                    </div>
                  )}
                  {club.whatsappGroupLink && (
                    <div className="mb-2 text-gray-600 text-sm">
                      WhatsApp Group Link:{' '}
                      <a
                        href={club.whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Join
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={likeLoading === club._id}
                        onClick={() => handleLike(club._id, Array.isArray(club.likes) && club.likes.includes(user?.id))}
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
                            const isEditing = editingComment && editingComment.commentId === comment._id && editingComment.clubId === club._id;
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
                                          onClick={() => handleEditComment(club._id, comment._id, comment.text)}
                                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                          title="Edit Comment"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(club._id, comment._id)}
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
                          onClick={() => handleAddComment(club._id)}
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
      </div>
    </div>
  );
};

export default Clubs;
