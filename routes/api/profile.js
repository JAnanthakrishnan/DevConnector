const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
/**
 * *@route  GET api/profile/me
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
 * *@route POST api/profile
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
      if (instagram) userProfile.social.instagram    = instagram;
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
/**
 * *@route GET api/profile
 * *@desc get all the profiles
 * *@access public
 */
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error...');
  }
});
/**
 * *@route GET api/profile/user/:user_id
 * *@desc get profile by user ID
 * *@access public
 */
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ errors: [{ msg: 'Profile not found' }] });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ errors: [{ msg: 'Profile not found' }] });
    }
    return res.status(500).send('Server Error');
  }
});

/**
 * *@route DELETE api/profile
 * *@desc  profile,user & posts
 * *@access private
 */
router.delete('/', auth, async (req, res) => {
  try {
    /**
     * TODO remove user posts
     */
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error...');
  }
});
/**
 * *@route PUT api/profile/experience
 * *@desc  add experience to profile
 * *@access private
 */
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'Start Date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error ...');
    }
  }
);
/**
 * *@route DELETE api/profile/experience/:exp_id
 * *@desc  delete experience from profile
 * *@access private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    /**
     * !Some confusion is here
     */
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * *@route PUT api/profile/education
 * *@desc  add education to profile
 * *@access private
 */
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldOfStudy', 'Field of study is required').not().isEmpty(),
      check('from', 'Start Date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldOfStudy,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    const newExp = {
      school,
      degree,
      fieldOfStudy,
      location,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error ...');
    }
  }
);
/**
 * *@route DELETE api/profile/experience/:exp_id
 * *@desc  delete experience from profile
 * *@access private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    /**
     * !Some confusion is here
     */
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * *@route GET api/profile/github/:username
 * *@desc  get github profile
 * *@access public
 */
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubClientSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
