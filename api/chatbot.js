import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the serverless function for the chatbot
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      console.log('Received message:', message);

      const response = await genAI.generateContent(message);
      const reply = response?.generated_text || 'Sorry, I could not understand your message.';
      console.log('Generated response:', reply);

      res.status(200).json({ reply });
    } catch (error) {
      console.error('Error processing chatbot request:', error);
      res.status(500).json({ error: 'Failed to process chatbot request' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' }); // Handle non-POST requests
  }
}
