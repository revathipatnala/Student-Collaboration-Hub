export declare const addComment: (req: AuthRequest, res: Response) => Promise<void>;
import type { AuthRequest } from '../middlewares/auth.js';
import type { Response } from 'express';
export declare const likeNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unlikeNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNotes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteNote: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNote: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=noteController.d.ts.map