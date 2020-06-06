const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
/**
 * *@route  get api/profile/me
 * *@desc get profile for the current user
 * *@access Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'There is no profile for this user' }] });
    }
    res.json({ profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error...');
  }
});

/**
 * *@route post api/profile
 * *@desc add profile for the user
 * *@access private
 */
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status should be mentioned').not().isEmpty(),
      check('skills', 'Skillset cannot be empty').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }
    const {
      status,
      skills,
      company,
      location,
      bio,
      website,
      githubUserName,
      twitter,
      facebook,
      instagram,
      linkedin,
      youtube
    } = req.body;
    /**
     * *Build profile object
     */
    const userProfile = {};
    //prettier-ignore
    {
         userProfile.user                            = req.user.id;
         userProfile.status                          = status;
         userProfile.skills                          = skills.split(',').map((skill) => skill.trim());
      if (company) userProfile.company               = company;
      if (location) userProfile.location             = location;
      if (bio) userProfile.bio                       = bio;
      if (githubUserName) userProfile.githubUserName = githubUserName;
      if (website) userProfile.website               = website;
         userProfile.social                          = {};
      if (facebook) userProfile.social.facebook      = facebook;
      if (twitter) userProfile.social.twitter        = twitter;
      if (youtube) userProfile.social.youtube        = youtube;
      if (linkedin) userProfile.social.linkedin      = linkedin;
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        /**
         * *Update the profile
         */
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: userProfile },
          { new: true }
        );
        return res.json({ profile });
      }
      profile = new Profile(userProfile);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error...');
    }
  }
);

module.exports = router;
