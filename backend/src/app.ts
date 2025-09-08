import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL|| 'http://localhost:5173' ,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware to log requests
/* app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    cookies: req.cookies,
    authorization: req.headers.authorization ? 'Present' : 'Missing'
  });
  next();
}); */

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
import eventRoutes from './routes/eventRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import lostAndFoundRoutes  from './routes/lostAndFoundRoutes.js';
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/lost-and-found', lostAndFoundRoutes);
import sellAndBuyRoutes from './routes/sellAndBuyRoutes.js';
app.use('/api/sell-and-buy', sellAndBuyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.use(/.*/, (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});



export default app;