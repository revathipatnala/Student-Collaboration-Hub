declare class OTPStore {
    private store;
    generateOTP(): string;
    storeOTP(email: string, purpose: 'signup' | 'signin', userData?: any): string;
    verifyOTP(email: string, otp: string, purpose: 'signup' | 'signin'): {
        valid: boolean;
        userData?: any;
    };
    private cleanExpiredOTPs;
}
declare const _default: OTPStore;
export default _default;
//# sourceMappingURL=otpStore.d.ts.map