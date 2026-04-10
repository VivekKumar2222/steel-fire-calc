const dotenv = require("dotenv");
dotenv.config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');

const User              = require('./models/User');
const OTP               = require('./models/OTP');
const { generateOTP, sendOTPEmail } = require('./services/emailService');
const { calculateTemperatures }     = require('./calculations');

const app = express();
//app.use(cors());
app.use(cors({
  origin: ['https://structguru.com', 'https://www.structguru.com']
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'structguru-dev-secret';

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ── Auth middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// ── SIGNUP — Step 1: send OTP ─────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(400).json({ success: false, error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const otp    = generateOTP();

    // Store OTP (delete any previous for this email)
    await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'signup' });
    await OTP.create({
      email:     email.toLowerCase().trim(),
      otp,
      purpose:   'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await sendOTPEmail(email, otp, 'signup');

    // Send back hashed password temporarily so frontend can pass it back on verify
    res.json({ success: true, pendingData: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send OTP. Check email config.' });
  }
});

// ── SIGNUP — Step 2: verify OTP and create user ───────────────────────────────
app.post('/api/auth/signup/verify', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, error: 'OTP is required' });

    const record = await OTP.findOne({ email: email.toLowerCase(), purpose: 'signup' });
    if (!record)
      return res.status(400).json({ success: false, error: 'OTP expired or not found. Please try again.' });
    if (new Date() > record.expiresAt)
      return res.status(400).json({ success: false, error: 'OTP has expired. Please try again.' });
    if (record.otp !== otp.trim())
      return res.status(400).json({ success: false, error: 'Incorrect OTP' });

    await OTP.deleteMany({ email: email.toLowerCase() });

    const user = await User.create({ name, email, password, isVerified: true });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── LOGIN — Step 1: verify credentials, send OTP ─────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, error: 'Invalid email or password' });

    const otp = generateOTP();
    await OTP.deleteMany({ email: user.email, purpose: 'login' });
    await OTP.create({
      email:     user.email,
      otp,
      purpose:   'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(user.email, otp, 'login');
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send OTP. Check email config.' });
  }
});

// ── LOGIN — Step 2: verify OTP ────────────────────────────────────────────────
app.post('/api/auth/login/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, error: 'OTP is required' });

    const record = await OTP.findOne({ email: email.toLowerCase(), purpose: 'login' });
    if (!record)
      return res.status(400).json({ success: false, error: 'OTP expired or not found. Please try again.' });
    if (new Date() > record.expiresAt)
      return res.status(400).json({ success: false, error: 'OTP has expired. Please try again.' });
    if (record.otp !== otp.trim())
      return res.status(400).json({ success: false, error: 'Incorrect OTP' });

    await OTP.deleteMany({ email: email.toLowerCase() });

    const user = await User.findOne({ email: email.toLowerCase() });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── Calculator ────────────────────────────────────────────────────────────────
app.post('/api/calculate', (req, res) => {
  try {
    const result = calculateTemperatures(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── Serve React ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
