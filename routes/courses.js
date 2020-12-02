'use strict';

var express = require("express");
const utility = require('./utility');
const db = require('../db');
const { Course, User } = db.models;
var router = express.Router();

// GET /courses
// returns all courses
router.get("/", utility.asyncHandler(async (req, res, next) => {
  let courses = await Course.findAll({
    attributes: {
      exclude: ["createdAt", "updatedAt"]
    },include: [{
      model: User,
      as: 'user',
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"]
      }
    }]
  });
  res.json(courses);
}));

// GET /courses/:id
// returns course by id
router.get("/:id", utility.asyncHandler(async (req, res, next) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id, {
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      },include: [{
        model: User,
        as: 'user',
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"]
        }
      }]
    });

    if (course) {
      await course.update(req.body);
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    utility.handleException(res, error);
  }
}));

// POST /course
// creates a new course
router.post("/", utility.authenticateUser, utility.asyncHandler(async (req, res, next) => {
  let course;
  try {
    course = await Course.create(req.body);
    res.setHeader('Location', req.baseUrl + "/" + course.id);
    res.status(201).end();
  } catch (error) {
    utility.handleException(res, error);
  }
}));

// PUT /course/:id
// updates a course by id
router.put("/:id", utility.authenticateUser, utility.asyncHandler(async (req, res, next) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
        // check that course belongs to user
        if(course.userId == req.currentUser.id){
          await course.update(req.body);
          res.status(204).end();
        }else{
          res.sendStatus(403);
        }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    utility.handleException(res, error);
  }
}));

// DELETE /course/:id
// Delete a course by id
router.delete("/:id", utility.authenticateUser, utility.asyncHandler(async (req, res) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
      // check that course belongs to user
      if(course.userId == req.currentUser.id){
        await course.destroy();
        res.status(204).end();
      }else{
        res.sendStatus(403);
      }
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    utility.handleException(res, error);
  }
}));

module.exports = router;
