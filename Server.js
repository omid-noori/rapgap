const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Authorization = require('./Routes/Authorization');
const Uploads = require('./Routes/Uploads');
require('dotenv').config();

const app = express();

// Middlewears
app.use(
  cors({
    credentials: true,
    // origin: ['http://localhost:8080/', 'http://192.168.52.101:8080/'],
  })
);
app.use(express.json());

// DB Connection

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URL, options)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Started at port ${PORT}`));
  })
  .catch((err) => console.log(err));
mongoose.connection.on('error', (err) => console.log(err));
mongoose.connection.once('open', (err) => console.log('Connected To DB!'));

// Routes

app.use('/', Authorization);
app.use('/uploads', Uploads);

// MONGO_URL=mongodb://localhost:27017/RapGap
