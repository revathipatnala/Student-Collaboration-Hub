import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [50, 'Full name must be less than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9]+\.[0-9]{2}\.[a-zA-Z]{3}@anits\.edu\.in$/, 'Please enter a valid institutional email (e.g., name.23.abc@anits.edu.in)']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (date) {
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();
                return age >= 13 && age <= 120;
            },
            message: 'Age must be between 13 and 120 years'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
UserSchema.index({ email: 1 });
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, candidatePassword);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map