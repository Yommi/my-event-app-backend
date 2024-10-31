const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const errorController = require('./Controllers/errorController');

const app = express();

// MORGAN LOGGER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER
app.use(express.json());

app.use(cors());

app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);

app.use('/api/v1/images', express.static('images'));

app.use(errorController);

module.exports = app;
