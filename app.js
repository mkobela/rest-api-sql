/***
 * @author Michael Kobela <mkobela@gmail.com>
 ***/

/******************************************
Treehouse FSJS Techdegree:
Project 9- REST API with Sequeilze
******************************************/
'use strict';

// load modules
const express = require('express');
const db = require('./db');
// const { sequelize } = require('./models');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

(async () => {
  // Test the connection to the database
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// setup users routes
app.use("/api/users", userRoutes);

// setup courses routes
app.use("/api/courses", courseRoutes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  getName();
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// Sequelize model synchronization, then start listening on our port.
db.sequelize.sync({ force: false })
  .then(() => {
    const server = app.listen(app.get('port'), () => {
      console.log(`Express server is listening on port ${server.address().port}`);
    });
  });


