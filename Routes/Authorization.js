const express = require('express');
const router = express.Router();

const {checkTokenSetUser} = require('../Middlewares/Middlewares');

const {
  mainHandler,
  signUpHandler,
  loginHandler,
  profilePic,
  multerUpload,
  profileUpload,
  About,
  messages,
} = require('../Functions/index');

router.get('/', mainHandler);

router.post('/signup', signUpHandler);

router.post('/login', loginHandler);

router.post(
  '/profilePicture',
  checkTokenSetUser,
  multerUpload.single('profilePicture'),
  profilePic
);
router.post('/profile', checkTokenSetUser, profileUpload);

router.get('/about', About);
router.post('/messages', messages);

module.exports = router;
