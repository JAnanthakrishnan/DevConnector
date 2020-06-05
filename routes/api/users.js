/**
 ** we bring in User from user model which defines the schema
 ** Express validator is brought for validating the req body
 ** Bcryptjs for hashing password
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

/**
 *! @route   post api/users
 *! @desc    Register users
 *! @access  public
 */

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Not valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      /**
       * TODO See if user exists
       * TODO Get user's gravatar
       * TODO Encrypt password
       * TODO Return jwt
       */
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      user = new User({
        name,
        email,
        avatar,
        password
      });
      /**
       * *Steps for hashing
       * *Genenrating salt by using bcrypt.genSalt()
       * *Hash password using bcrypt.hash(password,salt);
       */
      const salt = bcrypt.genSalt(10);
      user.password = bcrypt.hash(password, salt);
      await user.save();
      res.send(`Hello ${name}`);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error...');
    }
  }
);

module.exports = router;
