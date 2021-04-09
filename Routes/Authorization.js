const express = require('express');
const router = express.Router();

const {checkTokenSetUser} = require('../Middlewares/Middlewares');

const {
  mainHandler,
  signUpHandler,
  loginHandler,
  profilePic,
  multerUpload,
} = require('../Functions/index');

router.get('/', checkTokenSetUser, mainHandler);

router.post('/signup', signUpHandler);

router.post('/login', loginHandler);

router.post(
  '/profilePicture',
  checkTokenSetUser,
  multerUpload.single('profilePicture'),
  profilePic
);

module.exports = router;
