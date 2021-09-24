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

const BUCKET_NAME = 'video-bucket64';
const s3 = new AWS.S3({
  accessKeyId: process.env.s3_bucket_key,
  secretAccessKey: process.env.s3_bucket_secret
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', path.join(__dirname, 'public'))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  res.render('index')
})

app.post('/upload', type, async (req,res) => {
    // file_buf = new Buffer.from(req.body.data)
    const fileContent = fs.readFileSync(req.file.path)
    console.log(s3)
    const fileName = 'coverletter_video_' + (Math.random() + 1).toString(36).substring(4) + '.webm';
    let params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileContent
    }
    console.log(process.env.s3_bucket_key)

    s3.upload(params, async (err, data) => {
      if (err) {
        throw err;
      }
      console.log(data)
      res.send({go_to: '/test', fileName: fileName})

    })
    
 })

 app.get('/test', async (req,res) => {
    // console.log(req.query.fileName)
    let params = {
      Bucket: BUCKET_NAME,
      Key: req.query.fileName,
      Expires: 60 * 60 * 24 * 14
    }

    s3.getSignedUrl('getObject', params, async (err, url) => {
      if (err) { throw err;}
      console.log(url)
      res.render('myvideo', {video_signed_url: url})
    })

    
  })

app.listen('3000', () => {
  console.log ('Listening on port 3000')
})