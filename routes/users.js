'use strict';

const express = require("express");
const utility = require('./utility');
const db = require('../db');
const { User } = db.models;
const router = express.Router();


// GET /users
// returns registered user
router.get("/", utility.authenticateUser, utility.asyncHandler(async (req, res, next) => {
  
  if(req.currentUser){
    res.json(req.currentUser);
  }else {
    res.status(404).json({message: "User not found."});
  }
}));

// POST /users
// creates a new user
router.post("/", utility.asyncHandler(async(req, res, next) => {
  try {
    await User.create(req.body);
    res.setHeader('Location', "/");
    res.status(201).json({ "message": "Account successfully created!" });
  } catch (error) {
    utility.handleException(res, error);
  }
}));

module.exports = router;
