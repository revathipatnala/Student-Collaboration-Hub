import type { Request, Response, NextFunction } from 'express';
import { type IUser } from '../models/User.js';
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export type { AuthRequest };
//# sourceMappingURL=auth.d.ts.map