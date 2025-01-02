import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;



// Middleware for CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://haryiankkumra.vercel.app', // Deployed frontend
    'http://127.0.0.1:5500',            // Local development
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*'); // Allow specific origins or all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specify allowed methods
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
    ); // Specify allowed headers
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day

    if (req.method === 'OPTIONS') {
      res.status(204).end(); // Respond with no content for preflight requests
      return;
    }
  } else {
    res.status(403).send('CORS policy does not allow this origin'); // Deny request if origin is not allowed
  }

  next();
});

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(process.cwd(), './'))); // Serve static files

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process if DB connection fails
  });

// Contact Form Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  message: { type: String, required: false },
  submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify the transporter
transporter.verify((error) => {
  if (error) {
    console.error('Error verifying mail transporter:', error);
  } else {
    console.log('Mail transporter is ready');
  }
});

// Routes

// Health Check
app.get('/', (_req, res) => res.send('Server is running...'));

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();

    // Send email to admin
    const mailOptions = {
      from: `${name} <${email}>`,
      to: process.env.ADMIN_EMAIL, // Ensure the ADMIN_EMAIL is defined in your .env
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Log mail options to confirm
    console.log('Sending email with options:', mailOptions);

    await transporter.sendMail(mailOptions);

    // Auto-reply to sender
    const autoReplyOptions = {
      from: `Admin <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: 'Message Received',
      text: `Hi ${name},\n\nThank you for your message. I will get back to you soon.\n\nBest regards,\nAdmin`,
    };

    await transporter.sendMail(autoReplyOptions);

    res.status(200).json({ message: 'Form submitted and email sent successfully!' });
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    res.status(500).json({ error: 'Failed to handle form submission' });
  }
});

// Chatbot Integration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Received message:', message);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(message); // Just pass the message directly

    const reply = response?.generated_text || 'Sorry, I could not understand your message.';
    console.log('Generated response:', reply);
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ error: 'Failed to process chatbot request' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
