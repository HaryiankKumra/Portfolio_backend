app.post('/api/chatbot', async (req, res) => {
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
  
    try {
      console.log('Received message:', message);
      
      const response = await genAI.generateContent(message); // Use generateContent directly
  
      const reply = response?.generated_text || 'Sorry, I could not understand your message.';
      console.log('Generated response:', reply);
      res.status(200).json({ reply });
    } catch (error) {
      console.error('Error processing chatbot request:', error);
      res.status(500).json({ error: 'Failed to process chatbot request' });
    }
  });