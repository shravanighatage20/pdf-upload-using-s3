const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const serverless = require('serverless-http');
const fs = require('fs');
const path = require('path');

const app = express();
const s3 = new aws.S3();

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const fileContent = fs.readFileSync(req.file.path);
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: fileContent,
        ContentType: req.file.mimetype,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        fs.unlinkSync(req.file.path);
        res.status(200).send(data);
    });
});

app.get('/download/:filename', (req, res) => {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.params.filename,
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.attachment(req.params.filename);
        res.send(data.Body);
    });
});

module.exports.handler = serverless(app);
