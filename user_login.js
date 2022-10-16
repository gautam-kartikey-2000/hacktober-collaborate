const express = require('express');
const path = require('path');

const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const userschema = require('../models/user.js');

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from 'config';
// import pkg from 'express-validator';
//const { check, validationResult } = pkg;
//import { check, validationResult } from 'express-validator';
//import doctorschema from '../schemas/doctor.js';

//const router = express.Router();

router.post(
    '/',
    check('Email', 'Please include a valid email').exists(),
    check('Password', 'Password is required').exists(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const email = req.body.Email;
      const password = req.body.Password;
      //const { email, password } = req.body;
  
      try {
        let user = await userschema.findOne({ email });
        console.log(email);
        console.log(user);
  
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        
        const isMatch  = password === user.password;
        
        //const isMatch = await bcrypt.compare(password, user.password);
        console.log(password);
        console.log(user.password);
        console.log(isMatch);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Password' }] });
        }
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          ('jwtSecret'),
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );
  
  module.exports = router;
  