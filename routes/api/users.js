const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//@route   post api/users
//@desc    Register users
//@access  public
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      res.send(`Hello ${req.body.name}`);
    }
  }
);

module.exports = router;
