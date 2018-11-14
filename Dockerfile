FROM node:8

RUN node -v

# For cjpeg
RUN apt-get update && apt-get install
RUN apt-get install nasm
RUN apt-get install autoconf libtool
RUN apt-get install nasm

#for image-webpack-loader
RUN apt-get install libpng-dev
RUN apt-get update && apt-get install

COPY package.json package-lock.json ./

RUN npm install

COPY . .
# Also possible to expose 8080 and set the port in the beanstalk env params
EXPOSE 3000

CMD [ "npm", "start" ]

