const express = require("express");
const router = express.Router();

//@route   get api/auth
//@desc    test route
//@access  public
router.get("/", (req, res) => {
  res.send("Auth Route");
});

module.exports = router;
