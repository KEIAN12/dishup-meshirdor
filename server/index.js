import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import galleryRoutes from './routes/gallery.js';
import assetsRoutes from './routes/assets.js';
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS設定: 本番環境では環境変数から許可オリジンを取得
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // オリジンがない場合（Postmanなど）は許可
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
}));

// Stripe Webhook用のraw body parser（/api/stripe/webhook専用）
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// その他のルート用のJSONパーサー
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




