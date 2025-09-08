import Club from '../models/Club.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';
// Get all clubs
export const getClubs = async (req, res) => {
    try {
        const clubs = await Club.find();
        res.json(clubs);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
};
// Create a new club
export const createClub = async (req, res) => {
    try {
        let photoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'clubs');
            photoUrl = result.secure_url;
        }
        const { name, description, allowedYears, whatsappGroupLink, presidentName, contactNo, createdBy } = req.body;
        const club = new Club({
            name,
            description,
            allowedYears: Array.isArray(allowedYears) ? allowedYears : JSON.parse(allowedYears),
            whatsappGroupLink,
            presidentName,
            contactNo,
            createdBy,
            members: [],
            photoUrl,
        });
        await club.save();
        res.status(201).json(club);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create club' });
    }
};
// Delete a club
export const deleteClub = async (req, res) => {
    try {
        const { id } = req.params;
        await Club.findByIdAndDelete(id);
        res.json({ message: 'Club deleted' });
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete club' });
    }
};
// Update a club
export const updateClub = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        if (update.allowedYears && !Array.isArray(update.allowedYears)) {
            update.allowedYears = JSON.parse(update.allowedYears);
        }
        const club = await Club.findByIdAndUpdate(id, update, { new: true });
        res.json(club);
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update club' });
    }
};
//# sourceMappingURL=clubController.js.map