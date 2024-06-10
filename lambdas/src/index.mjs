import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parse } from 'url';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({ region: 'ca-central-1' });
const { BUCKET_NAME } = process.env;

export const uploadPdf = async (event) => {
  const { body } = event;
  const buffer = Buffer.from(body, 'base64');
  const key = `${uuidv4()}.pdf`;

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf'
    };

    await s3.send(new PutObjectCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ key }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

export const getPdf = async (event) => {
  const { key } = event.pathParameters;

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};
