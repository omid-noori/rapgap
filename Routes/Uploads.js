const express = require('express');
const router = express.Router();

const {checkTokenSetUser} = require('../Middlewares/Middlewares');
const {
  Uploads,
  getUploads,
  multerUpload,
  getFile,
  deletePost,
  UserPosts,
  updatePost,
} = require('../Functions/index');

router.get('/', getUploads);
router.get('/userPosts', checkTokenSetUser, UserPosts);
router.get('/media/:fileKey', getFile);

router.post('/', checkTokenSetUser, multerUpload.array('data', 2), Uploads);

router.delete('/delete/:postId', checkTokenSetUser, deletePost);

router.put('/update/:post_id', checkTokenSetUser, updatePost);

module.exports = router;
