const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios');
var uuid = require('uuid');

// import express from 'express';
// import mongoose from 'mongoose';
// import path from 'path';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import  config  from 'config';
// import { check, validationResult } from 'express-validator';
// import userSchema from '../models/user.js'


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
//const normalize = require('normalize-url');

//console.log(uuid.v4());
const userSchema = require('../models/user');


router.post(
 '/',
 check('Name', 'Name is required').exists(),
 check('Email', 'Please include a valid email').exists(),
 check(
   'Password',
   'Please enter a password with 6 or more characters'
 ).isLength({ min: 6 }),
 check( 'Age', 'please add age').exists(),
 check( 'Blood_group', 'please add blood group' ).exists(),
 check('City', 'Residence City is required'),
 check('State', 'Residence state is required'),
 check('Pincode', 'Residence pincode is required'),
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


   const  name = req.body.Name;
   const email = req.body.Email;
   const password  = req.body.Password;
   const age = req.body.Age;
   const blood_group = req.body.Blood_group;
   const city = req.body.City;
   const state = req.body.State;
   const pincode = req.body.Pincode;
   const phone_number = req.body.Phone_number;
   const userId =  uuid.v4();
   //let locations;
   console.log(name,email,password);

   const url='https://api.mapbox.com/geocoding/v5/mapbox.places/'+ city + " " + state +'.json?access_token=pk.eyJ1IjoibWFoYWstcmF3YXQiLCJhIjoiY2tra3FpZjN1MDNoMjJ3bG9sdDdhdTY0ayJ9.zaTDuw_EF0IjEd3e8jwiQQ&limit=1'
    await axios.get(url)
    .then(({data})=>{
        
        req.body.location={type:'Point',coordinates:[data.features[0].center[0],data.features[0].center[1]]}
        console.log(req.body.location.type);})
        
    .catch((err)=>{res.status(400).send(err)});

   try {
     let user = await userSchema.findOne({ email : email });

     if (user) {
       return res
         .status(400)
         .json({ errors: [{ msg: 'User already exists' }] });
     }

   //   const avatar = normalize(
   //     gravatar.url(email, {
   //       s: '200',
   //       r: 'pg',
   //       d: 'mm'
   //     }),
   //     { forceHttps: true }
   //   );

     console.log(req.body.location);
     let locations =req.body.location;
     user = new userSchema({
       name : name,
       phone_number: phone_number,
       age : age,
       blood_group: blood_group,
       email :email,
       password:password,
       location :{
       city: city,
       state: state,
       pincode: pincode,
       },
       location_coordinates: locations,
       userID: userId
   

     });

    //  const salt = await bcrypt.genSalt(10);

    //  user.password = await bcrypt.hash(password, salt);

     await user.save();

     const payload = {
        user: {
          id: user.id,
          type: 2
        }
      };

     jwt.sign(
       payload,
       'jwtSecret',

       (err, token) => {
         if (err) throw err;
         res.json({ token,user });
       }
    );
   } catch (err) {
     console.error(err.message);
     res.status(500).send('Server error');
   }
 }
);

module.exports = router ;