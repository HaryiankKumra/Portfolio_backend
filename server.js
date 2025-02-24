import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = [
  'https://haryiankkumra.vercel.app',
  'http://127.0.0.1:5500',
  'https://haryiank.me',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, POST, OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.options('*', cors()); // Handle preflight requests

// Body Parsing Middleware
app.use(express.json());

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
      to: process.env.ADMIN_EMAIL,
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    // Auto-reply to sender
   const autoReplyOptions = {
    from: `Haryiank <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: 'Message Received',
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>Email Template</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
              <tr>
                  <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%); color: #ffffff;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                              <td style="text-align: center;">
                                  <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #ffffff; color: #4e4376; font-size: 30px; font-weight: bold; line-height: 80px; margin: 0 auto 15px auto; text-align: center;">HK</div>
                                  <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;color: #e0e0e0;">Haryiank Kumra</h1>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              
              <tr>
                  <td style="padding: 50px 30px 40px 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                              <td style="color: #333333; font-size: 18px; line-height: 1.6; text-align: center;">
                                  <p style="margin: 0 0 30px 0;">Hi ${name},</p>
                                  <p style="margin: 0 0 30px 0;">Thanks for your message. I will get back to you soon.</p>
                                  <hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 30px 0;">
                                  <p style="margin: 0; font-weight: 500; color: #555555; font-size: 16px;">Best Regards,</p>
                                  <p style="margin: 5px 0 0 0; font-weight: bold; color: #2b5876; font-size: 20px;">Haryiank Kumra</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              
              <tr>
                  <td style="padding: 30px; background-color: #f5f5f5; text-align: center;">
                      <p style="margin: 0 0 20px 0; font-size: 14px; color: #555555; letter-spacing: 1px; text-transform: uppercase;">Follow me on</p>
                      
                      <table align="center" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="padding: 0 10px;">
                                  <a href="https://www.linkedin.com/in/haryiank-kumra-09374b202/" style="text-decoration: none;">
                                      <img src="https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2-free/128/social-linkedin-circle-512.png" width="40" height="40" alt="LinkedIn" style="display: block; border: 0;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://www.instagram.com/haryiank/" style="text-decoration: none;">
                                      <img src="https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Instagram_colored_svg_1-512.png" width="40" height="40" alt="Instagram" style="display: block; border: 0;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://x.com/KumraHaryiank" style="text-decoration: none;">
                                      <img src="https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Twitter_colored_svg-512.png" width="40" height="40" alt="Twitter" style="display: block; border: 0;" />
                                  </a>
                              </td>
                              <td style="padding: 0 10px;">
                                  <a href="https://leetcode.com/u/Haryiank/" style="text-decoration: none;">
                                      <img src="https://cdn.iconscout.com/icon/free/png-256/free-leetcode-3628885-3030025.png" width="40" height="40" alt="LeetCode" style="display: block; border: 0;" />
                                  </a>
                              </td>
                          </tr>
                      </table>
                      
                      <p style="margin: 25px 0 0 0; font-size: 12px; color: #999999;">&copy; 2025 Haryiank Kumra | All rights reserved</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `,
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
    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text(); // Extract text from the response

    console.log('Generated response:', reply);
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ error: 'Failed to process chatbot request' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
