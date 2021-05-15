// Models
const User = require('../Models/User');
const Login = require('../Models/Login');
const Music = require('../Models/music');
const Message = require('../Models/message');
// Packages
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const paypal = require('paypal-rest-sdk');
const path = require('path');
require('dotenv').config({path: process.cwd() + '/.env'});

// '/' Route
const mainHandler = (req, res) => {
  res.status(200).json({message: 'Hello, Welcome'});
};
// '/signup'
const signUpHandler = (req, res) => {
  const {userName} = req.body;
  const newUser = new User(req.body);
  newUser.validate((error) => {
    if (error) {
      // 400 Bad Request
      res.status(400).json(error.errors);
    } else {
      User.findOne({userName}, (error, user) => {
        if (error) {
          // 406 Not Acceptable
          res.status(406).json({message: 'Something went wrong! 😐'});
        } else if (user) {
          // 422 Unprocessable Entity
          return res.status(422).json({
            message: 'Username alredy exists, please choose another one. 🛑',
          });
        } else {
          newUser.save((error, savedUser) => {
            if (error) {
              res.status(500).json({message: 'Something went wrong! 😐'});
            } else {
              res.status(201).json({message: 'User have been created!'});
            }
          });
        }
      });
    }
  });
};

const createTokenSendResponse = (User, res) => {
  let {_id, userName, role} = User;
  Jwt.sign(
    {_id, userName, role},
    process.env.ACCESS_TOKEN,
    {
      expiresIn: '24h',
    },
    (error, token) => {
      if (error) {
        res
          .status(500)
          .json({message: 'Server could not create Token. ', error});
      } else {
        User.password = undefined;
        res.status(200).json({User, token});
      }
    }
  );
};

const comparePasswordSendResponse = (User, password, res) => {
  bcrypt.compare(password, User.password).then((isMatch, err) => {
    if (err) {
      res.status(500).json({message: 'Error while comparing password!', err});
    } else {
      if (isMatch) {
        createTokenSendResponse(User, res);
      } else {
        res.status(401).json({
          message: 'Username or password is wrong! 😐',
        });
      }
    }
  });
};

const loginHandler = (req, res) => {
  const {userName, password} = req.body;
  console.log(req.body);
  const loginUser = new Login(req.body);
  loginUser.validate((error) => {
    if (error) {
      res.status(400).json(error.errors);
    } else {
      User.findOne({userName}, (error, document) => {
        if (error) {
          res.status(500).json(error);
        } else if (document) {
          comparePasswordSendResponse(document, password, res);
        } else {
          res.status(401).json({message: 'Username or password is wrong! 😐'});
        }
      });
    }
  });
};

// Handling Uploads
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});

const multerUpload = multer({storage});

const AWSOptions = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.AWS_BUCKET_NAME,
  region: process.env.AWS_REGION,
};

const s3 = new AWS.S3(AWSOptions);

const AWS_Upload = (files, callback) => {
  let responseData = [];
  files.map((file) => {
    let fileName = file.originalname.split('.');
    let fileType = fileName[fileName.length - 1];
    let params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid.v4()}.${fileType}`,
      Body: file.buffer,
      ACL: 'public-read',
    };
    s3.upload(params, (error, data) => {
      if (error) {
        callback(null, error);
      } else {
        responseData.push(data);
        if (responseData.length === 2) {
          callback(responseData, null);
        }
      }
    });
  });
};

const Uploads = (req, res) => {
  const {files, body} = req;
  let json = JSON.parse(body.data);

  AWS_Upload(files, (result, error) => {
    if (error) {
      res.status(400).json(error);
    } else {
      result.forEach((file, index, array) => {
        let URL = file.Key;
        let split = URL.split('.');
        let type = split[split.length - 1];
        // console.log('type', type);
        if (type === 'mp3') {
          json.music = file;
        } else {
          json.cover = file;
        }
        if (index === array.length - 1) {
          json.uploadedBy = req.user._id;
          const newMusic = new Music(json);
          // console.log(newMusic);
          newMusic.validate((error) => {
            if (error) {
              res
                .status(400)
                .json({message: 'Error, Something Went Wrong! 😐', error});
            } else {
              newMusic.save((error, savedMusic) => {
                if (error) {
                  res
                    .status(500)
                    .json({message: 'Error, Something went wrong! 😐', error});
                } else {
                  res
                    .status(201)
                    .json({message: 'Upload succeed! 😉', savedMusic});
                }
              });
            }
          });
        }
      });
    }
  });
};

// Uploads Get Musics

const getUploads = (req, res) => {
  Music.find({public: true}, (error, docs) => {
    if (error) {
      res.status(500).json({message: 'Could not Find any music!', error});
    } else {
      res.status(200).json(docs);
    }
  });
};

// Get specific file

const getFile = async (req, res) => {
  console.log(req.params);
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.fileKey,
    };
    // res.status(206);
    await s3.getObject(params).createReadStream().pipe(res);
  } catch (error) {
    console.log(error);
    return res.status(400).json({message: 'Something went wrong!'});
  }
};

const deletePost = (req, res) => {
  console.log(req.params);
  Music.findById(req.params.postId, (error, result) => {
    if (error) {
      res.status(404).json({message: 'Post Not Found'});
    } else {
      if (result.uploadedBy == req.user._id) {
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Delete: {
            Objects: [
              {
                Key: result.cover.Key,
              },
              {
                Key: result.music.Key,
              },
            ],
            Quiet: false,
          },
        };
        s3.deleteObjects(params, (err, data) => {
          if (err) {
            res.status(400).json('Could not delete files!');
          } else {
            if (data) {
              result.remove();
              res.status(200).json({message: 'Successfully deleted', data});
            }
          }
        });
      } else {
        res.status(401).json({message: 'Unauthorized!'});
      }
    }
  });
};

const profilePic = (req, res) => {
  const {user, file} = req;
  let fileName = file.originalname.split('.');
  let fileType = fileName[fileName.length - 1];
  const filter = {_id: user._id};
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuid.v4()}.${fileType}`,
    Body: file.buffer,
    ACL: 'public-read',
  };
  User.findById(filter, (error, adventure) => {
    if (error) {
      res.status(500).json({message: 'Unaccessable file!'});
    } else {
      if (adventure.profilePic === undefined) {
        uploadProfilePic(params, user, res);
      } else {
        const param = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: adventure.profilePic.key,
        };
        console.log(param);
        s3.deleteObject(param, (err, deletedData) => {
          if (err) {
            console.log(err);
            res
              .status(500)
              .json({message: 'Could not delete previous profile picture!'});
          } else {
            console.log(deletedData);
            uploadProfilePic(params, user, res);
          }
        });
      }
    }
  });
};

const uploadProfilePic = (params, user, res) => {
  const {_id} = user;
  s3.upload(params, (error, updatedData) => {
    if (error) {
      res.status(500).json({message: 'Unaccessable file!', error});
    } else {
      const update = {$set: {profilePic: updatedData}};
      User.updateOne({_id}, update, {new: true}, (e, writeOpResult) => {
        if (e) {
          res.status(501).json({message: 'Unaccessable file!', error});
        } else {
          res.status(200).json({updatedData, writeOpResult});
        }
      });
    }
  });
};

const UserPosts = (req, res) => {
  console.log(req.user._id);
  Music.find({uploadedBy: req.user._id}, (error, result) => {
    if (error) {
      res.status(400).json({message: 'Somthing went Wrong!'});
    } else {
      res.status(200).json(result);
    }
  });
};

const updatePost = (req, res) => {
  console.log('USER_ID', req.user._id);
  console.log('PARAMS_POST_ID', req.params.post_id);
  console.log('BODY', req.body);
  Music.findOneAndUpdate(
    {_id: req.params.post_id},
    req.body,
    {new: true, useFindAndModify: true},
    (e, data) => {
      if (e) {
        res.status(404).json({message: 'Not Found!'});
      } else {
        // console.log(data.uploadedBy, req.user._id);
        res.json(data);
      }
    }
  );
};

const profileUpload = (req, res) => {
  console.log(req.body);
  User.findOneAndUpdate(
    {_id: req.user._id},
    req.body,
    {
      new: true,
      useFindAndModify: true,
    },
    (error, data) => {
      if (error) {
        res.status(400).json({message: 'Not Found!'});
      } else {
        data.password = undefined;
        res.status(200).json(data);
      }
    }
  );
};

const About = (req, res) => {
  User.findById('6039457ffbaa7e050c951a24', (error, data) => {
    if (error) {
      res.status(400).json({message: 'Something went wrong!'});
    } else {
      data.password = undefined;
      data.profilePic = data.profilePic.Key;
      res.status(200).json(data);
    }
  });
};

const messages = (req, res) => {
  console.log(req.body);
  // res.status(200).json('Hell Done!');
  const newMessage = new Message(req.body);
  newMessage.validate((error) => {
    if (error) {
      res.status(400).json({message: 'Something went wrong'});
    } else {
      newMessage.save((error, savedMessage) => {
        if (error) {
          res.status(400).json({message: 'Something went wrong'});
        } else {
          res.status(200).json(savedMessage);
        }
      });
    }
  });
};

let total;

const Pay = (req, res) => {
  paypal.configure({
    mode: 'live', //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
  });
  total = req.body.price;
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `${process.env.DOMAIN}/paySuccess`,
      cancel_url: `${process.env.DOMAIN}/payCancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Donation',
              sku: 'Donate',
              price: req.body.price,
              currency: 'SEK',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'SEK',
          total: req.body.price,
        },
        description: 'This is the payment description.',
      },
    ],
  };
  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      throw error;
    } else {
      console.log('Create Payment Response');
      console.log(payment);
      payment.links.forEach((link) => {
        if (link.rel === 'approval_url') {
          res.status(200).json({approval_url: link.href});
        }
      });
    }
  });
};
const paySuccess = (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'SEK',
          total: total,
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      res.status(400).json({message: 'Something went wrong!'});
    } else {
      console.log(payment);
      res.sendFile(path.join(__dirname, 'Views/index.html'));
    }
  });
};
const payCancel = (req, res) => {
  res.status(400).json({message: 'Payment Canceled!'});
};
module.exports = {
  mainHandler,
  signUpHandler,
  loginHandler,
  Uploads,
  multerUpload,
  getUploads,
  getFile,
  deletePost,
  profilePic,
  UserPosts,
  updatePost,
  profileUpload,
  About,
  messages,
  Pay,
  paySuccess,
  payCancel,
};
