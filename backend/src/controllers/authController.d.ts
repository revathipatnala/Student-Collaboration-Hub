import type { Request, Response } from 'express';
export declare const sendSignupOTP: (req: Request, res: Response) => Promise<void>;
export declare const verifySignupOTP: (req: Request, res: Response) => Promise<void>;
export declare const sendSigninOTP: (req: Request, res: Response) => Promise<void>;
export declare const verifySigninOTP: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => void;
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map