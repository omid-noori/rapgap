const Jwt = require('jsonwebtoken');
require('dotenv').config();

const checkTokenSetUser = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      Jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
          console.log(err.name);
          if (err.name === 'TokenExpiredError') {
            res.status(401).json({
              message: 'Token have been expired, please login again. 😊',
              err,
            });
            return;
          } else {
            res.status(401).json({
              message: 'Something went wrong, please try it again!',
              err,
            });
            return;
          }
        }
        req.user = user;
        next();
      });
    } else {
      res
        .status(404)
        .json({message: 'No token found in authentication header!'});
    }
  } else {
    res.status(404).json({message: 'No authentication header found!'});
  }
};

module.exports = {
  checkTokenSetUser,
};
