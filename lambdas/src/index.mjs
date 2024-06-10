import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const postHandler = async (event) => {
  const { body } = event;
  const buffer = Buffer.from(body, 'base64');
  const key = `uploads/${Date.now()}.pdf`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf'
  };

  try {
    await s3.putObject(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', key }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'File upload failed', error }),
    };
  }
};

export const getHandler = async (event) => {
  const key = event.pathParameters.key;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: data.Body.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'File retrieval failed', error }),
    };
  }
};
