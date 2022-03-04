const express = require('express');
const app =  express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const env = require('dotenv').config();
const multer = require('multer');
const upload = multer({dest: __dirname + '/public/uploads/'});
const type = upload.single('file')
const bodyParse = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({extended: false})
const fs = require('fs')
const AWS = require('aws-sdk');
const moment = require('moment');

const BUCKET_NAME = 'video-bucket64';
const s3 = new AWS.S3({
  accessKeyId: process.env.s3_bucket_key,
  secretAccessKey: process.env.s3_bucket_secret
})

const video_expires_days = 14; // 14 days to expire from S3

app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true}))
app.set('views', path.join(__dirname, 'public'))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  res.render('index')
})

app.post('/upload', type, async (req,res) => {
    const fileContent = fs.readFileSync(req.file.path)
    const fileName = 'coverletter_video_' + (Math.random() + 1).toString(36).substring(4) + '.mp4';
    const todayDate = new Date();
    const expiresOn = new Date();
          expiresOn.setDate(expiresOn.getDate() + video_expires_days);
    let params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      Metadata: {
        'date_uploaded': todayDate.toDateString(),
        'full_name': "",
        'Expires_On': expiresOn.toDateString()
      }
    }

    s3.upload(params, async (err, data) => {
      if (err) {
        throw err;
      }
      fs.unlink(req.file.path, (err) => {
        if (err) { throw new Error(err)};
      })
      res.send({go_to: '/test', fileName: fileName})

    }) 
 })

app.get('/test', async (req,res) => {
  let params = {
    Bucket: BUCKET_NAME,
    Key: req.query.fileName
  }

  let returned_metadata = {};
  s3.getObject( params, (err, data) => {
    if (err) { throw new Error(err)}
    returned_metadata = data.Metadata;
    s3.getSignedUrl('getObject', params,  (err, url) => {
      if (err) { throw err;}
      res.render('myvideo', {
        video_signed_url: url, 
        full_name: returned_metadata.full_name,
        expires_on: returned_metadata.expires_on,
        date_uploaded: returned_metadata.date_uploaded
      })
    })
  })
})

app.listen('4000', () => {
  console.log ('Listening on port 4000')
})