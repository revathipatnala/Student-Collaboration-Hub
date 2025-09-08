class OTPStore {
    store = new Map();
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    storeOTP(email, purpose, userData) {
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        this.store.set(email, {
            otp,
            email,
            expiresAt,
            purpose,
            userData
        });
        // Clean up expired OTPs
        this.cleanExpiredOTPs();
        return otp;
    }
    verifyOTP(email, otp, purpose) {
        const otpData = this.store.get(email);
        if (!otpData) {
            return { valid: false };
        }
        if (otpData.expiresAt < new Date()) {
            this.store.delete(email);
            return { valid: false };
        }
        if (otpData.otp !== otp || otpData.purpose !== purpose) {
            return { valid: false };
        }
        const userData = otpData.userData;
        this.store.delete(email);
        return { valid: true, userData };
    }
    cleanExpiredOTPs() {
        const now = new Date();
        for (const [email, otpData] of this.store.entries()) {
            if (otpData.expiresAt < now) {
                this.store.delete(email);
            }
        }
    }
}
export default new OTPStore();
//# sourceMappingURL=otpStore.js.map