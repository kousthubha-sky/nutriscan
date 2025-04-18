const express = require('express')
const app = express()
const router = express.Router()
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const {body, validationResult} = require('express-validator');

router.get('/signup', (req, res) => {
  res.render('register')
})
router.post('/signup',
  body('username').trim().isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').trim().isLength({min: 5}).withMessage('Password must be at least 8 characters long'),

  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'User registration failed',
      })
    }
    const { email, username, password, role } = req.body

    // Check if the username already exists
    const existingUser = await userModel.findOne({ username: username.toLowerCase() })
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists'
      })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    //whenever a new user is created it will be saved in the database in this const variable
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user'  // Only set admin if explicitly specified
    })

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
    
    res.json(userResponse)
  }
)

router.get('/login', (req, res) => {
  res.render('login')
})
router.post('/login',
  body('username').trim().isLength({min: 3}),
  body('password').trim().isLength({min: 5}),
  async (req, res) => {

    const errors = validationResult(req)

    if(!errors.isEmpty()){
      return res.status(400).json({
        errors: errors.array(),
        message: 'User login failed'
      })
    }
    const { username, password } = req.body
    console.log(req.body)
    console.log('Login Request Body:', req.body);
    

    //this will find the user in the database
    //if the user is not found it will return a message
    const user= await userModel.findOne({ 
      username: username.toLowerCase()
    })
    if(!user){
      return res.status(400).json({
        message: 'Username or password incorrect'
      })
    }

    console.log('Input Password:', password);
    
      //if the user is not found in the database it will return this message
    const isMatch = await bcrypt.compare(password, user.password)
    //if the password is not correct it will return this message
    if(!isMatch) {
      return res.status(400).json({ message: 'password incorrect' });
  }
  // Return user data without password
  const userData = {
      username: user.username,
      email: user.email,
      _id: user._id,
      role: user.role  // Include role in response
  };
  return res.status(200).json({ message: 'Login successful', user: userData });

  
    //json web token
  //   const token = jwt.sign({
  //     userId: user._id,
  //     email: user.email,
  //     username: user.username
  //   },
  //   process.env.JWT_SECRET,
  //   { expiresIn: '1h' } // Add expiresIn option
  // )
  // res.cookie('token', token)
  

   } // Close the async function properly

)
module.exports = router