import mongoose from 'mongoose';

const cached = global.mongo || {};

if (!cached.conn) {
  cached.conn = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const connectToDatabase = async () => {
  if (!cached.conn) {
    console.log('Connecting to MongoDB...');
    cached.conn = await mongoose.connect(process.env.MONGO_URI);
  }
  return cached.conn;
};

export { connectToDatabase };
