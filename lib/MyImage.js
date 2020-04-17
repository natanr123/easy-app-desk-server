import sharp from "sharp";

export default class MyImage {
    static saveScreenShootToLocal(path, outputPath, outputFilename, photoType) {
        console.log('screenshoot: ', path);
        const image = sharp(`./${path}`);
        const response = (data)=> {
            console.log('converted image', data);
            const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
            res.send(output);
        };
        return image.metadata()
            .then((metadata) => {
                console.log('metadata: ', metadata);
                const width = metadata.width;
                const height = metadata.height;

                if (width<=height){
                    if(width < 320) {
                        console.log('width lower than 320');
                        return image.resize(320,null).png().toFile(outputPath)
                    } else {
                        console.log('height higher than 320');
                        return image.png().toFile(outputPath)
                    }
                } else {

                    if(height < 320) {
                        console.log('height lower than 320');
                        return image.resize(null,320).png().toFile(outputPath)

                    } else {
                        console.log('height higher than 320');
                        return image.png().toFile(outputPath);
                    }
                }
            });

    };
}