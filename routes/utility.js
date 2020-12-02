
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const db = require('../db');
const { User } = db.models;


/***
 * @function asyncHandler - Handler function to wrap each route
 * @property {object} cb - callback
 * @returns {function} handler
***/
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
};

/***
 * @function handleException - exception handler
 * @property {object} res - response
 * @property {object} error - error
***/
function handleException(res, error) {
  console.log('ERROR: ', error.name);

  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    const errors = error.errors.map(err => err.message);
    res.status(400).json({ errors });
  } else {
    throw error;
  }
}

/***
 * @function authenticateUser - check for registered user
 * @property {object} req - request
 * @property {object} res - response
 * @property {object} next - next
***/
const authenticateUser = async (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store
    // by their username (i.e. the user's "key"
    // from the Authorization header).
    const users = await User.findAll();

    const user = users.find(u => u.emailAddress === credentials.name);

    // If a user was successfully retrieved from the data store...
    if (user) {
      // Use the bcryptjs npm package to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the data store.
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);

      // If the passwords match...
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);

        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        
        let { id, firstName, lastName, emailAddress } = user;
        let resUser = { id, firstName, lastName, emailAddress };

        req.currentUser = resUser;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

module.exports = { asyncHandler, handleException, authenticateUser };