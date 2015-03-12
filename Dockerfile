FROM nodesource/jessie:0.12

MAINTAINER William Blankenship <william.jblankenship@gmail.com>

EXPOSE 8888
ENV NODE_ENV production
VOLUME /var/log

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/

CMD ["npm", "start"]
