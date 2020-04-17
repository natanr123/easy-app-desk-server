import sharp from "sharp";
import AWS from "aws-sdk";

export default class MyS3 {
    static uploadFileToS3(localFilePath, s3FileName) {
        const image = sharp(localFilePath);
        return image.toBuffer()
            .then((buffer) => {
                return MyS3.uploadBufferToS3(buffer, s3FileName);
            });
    };

    static uploadBufferToS3(buffer, s3FileName) {
        AWS.config.update({region: 'us-west-2'});

        const S3_BUCKET = process.env.S3_BUCKET;
        const AWS_REGION = process.env.AWS_REGION;
        console.log('S3_BUCKETS3_BUCKETS3_BUCKET: ', S3_BUCKET, AWS_REGION)
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});


        const params = {
            Bucket: S3_BUCKET,
            Key: s3FileName,
            Body: buffer
        };
        const putObjectPromise = s3.upload(params).promise();
        return putObjectPromise.then(function(data) {
            console.log('Success: ', data);
            return data;
        });


    };

}