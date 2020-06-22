const express = require('express');
const router = express.Router();

/**
 * *@route  GET api/profile/me
 * *@desc get profile for the current user
 * *@access Private
 */
router.get('/', (req, res) => {
  res.send('Posts Route');
});

module.exports = router;
