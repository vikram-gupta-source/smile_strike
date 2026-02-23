const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config();

const app = express();
// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGODB_DATABASE_NAME })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ROUTES
const authRoutes = require('./routes/auth'); // This matches your new folder!
app.use('/', authRoutes);

app.get('/', (req, res) => res.send("Server is alive!"));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));