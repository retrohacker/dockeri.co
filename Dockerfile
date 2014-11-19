FROM nodesource/node:jessie

MAINTAINER William Blankenship <william.jblankenship@gmail.com>

EXPOSE 8888
ENV NODE_ENV production
VOLUME /var/log

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
WORKDIR /usr/src/app

CMD ["npm", "start"]
