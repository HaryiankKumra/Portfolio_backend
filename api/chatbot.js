import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the serverless function for the chatbot
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    // Validate the input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      console.log('Received message:', message);

      // Get the generative model
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Generate content
      const result = await model.generateContent(message);
      const response = await result.response;
      const reply = response.text(); // Extract the response text

      console.log('Generated response:', reply);

      // Send the response back to the client
      res.status(200).json({ reply });
    } catch (error) {
      console.error('Error processing chatbot request:', error);
      res.status(500).json({ error: 'Failed to process chatbot request' });
    }
  } else {
    // Handle non-POST requests
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
