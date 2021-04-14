# RapGap NodeJs Server

In this project i have a login and signup authentication system and upload, get, put and delete routes for objects and files that represents a specific uploaded music by authenticated user.
Website have three roles and by signing up users get a "User" Role. User role can not upload music. second role is "Arthist" that have access to upload, get, put and delete routes and the Third role is "Admin" that can access all routes. In this project i have two databases, one to store files "Amazon Web Services S3" and other "MongoDb" to store information about user and uploaded musics in json format.

## Dependencies used in this project

[1. Express](##express)
[2. Mongoose](##mongoose)
[3. Aws-sdk](##aws-sdk)
[4. Multer](##multer)
[5. Bcryptjs](##bcryptjs)
[6. Jsonwebtoken](##jsonwebtoken)
[7. Cors](##cors)
[8. Dotenv](##dotenv)
[9. Uuid](##uuid)

# Dependencies description

## express

> Used to create a Rest API web server

## mongoose

> Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node. js. It manages relationships between data, provides schema validation, and is used to translate between objects in code and the representation of those objects in MongoDB.

## aws-sdk

> Used to access and manage AWS services
> I used S3 service of AWS to Store All my files "audio && images"

## multer

> Used to upload files and handling data type multipart/form-data

## bcryptjs

> Used to hash and compare password

## jsonwebtoken

> Used to create Json Web Token for authorized users

## cors

> Cross-Origin Resource Sharing is an HTTP-header based mechanism that allows a server to indicate any other origins (domain, scheme or port).
> Uesd to communicate with Client that runs in diffrent domain

## dotenv

> Used to hide my API secret information about my databases

## uuid

> "Universally unique identifier" Used to create a unique 128-bit number for my uploaded file name
