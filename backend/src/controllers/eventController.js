import Event from '../models/Event.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
// ✅ Create Event
export const createEvent = async (req, res) => {
    try {
        let photoUrl = '';
        console.log('Received file:', req.file);
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file, 'events');
                console.log('Cloudinary upload result:', result);
                photoUrl = result.secure_url;
            }
            catch (cloudErr) {
                console.error('Cloudinary upload error:', cloudErr);
            }
        }
        const event = new Event({
            ...req.body,
            photoUrl,
        });
        await event.save();
        console.log('Saved event:', event);
        res.status(201).json(event);
    }
    catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};
// ✅ Get Events
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};
// ✅ Update Event
export const updateEvent = async (req, res) => {
    try {
        let photoUrl = req.body.photoUrl || '';
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file, 'events');
                photoUrl = result.secure_url;
            }
            catch (cloudErr) {
                console.error('Cloudinary upload error:', cloudErr);
            }
        }
        const updateData = { ...req.body };
        if (photoUrl) {
            updateData.photoUrl = photoUrl;
        }
        const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
};
// ✅ Delete Event
export const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
};
//# sourceMappingURL=eventController.js.map