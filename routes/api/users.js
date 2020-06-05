const express = require("express");
const router = express.Router();

//@route   get api/users
//@desc    test route
//@access  public
router.get("/", (req, res) => {
  res.send("User Route");
});

module.exports = router;
