const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const errorController = require('./Controllers/errorController');

const app = express();

// MORGAN LOGGER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER
app.use(express.json());

app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorController);

module.exports = app;
