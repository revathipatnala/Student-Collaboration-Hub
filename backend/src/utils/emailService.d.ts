declare class EmailService {
    private transporter;
    constructor();
    sendOTP(email: string, otp: string, purpose: 'signup' | 'signin'): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map