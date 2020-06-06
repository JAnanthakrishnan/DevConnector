const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = (req, res, next) => {
  /**
   * TODO Get jwt from header
   * TODO Check if no token
   * TODO If there is token verify token
   */
  const token = req.header('x-auth-token');
  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: 'No Token,Authorization denied' }] });
  }
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ errors: [{ msg: 'Invalid Token,Authorization denied' }] });
  }
};
