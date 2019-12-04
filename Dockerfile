FROM node:9

WORKDIR /app

COPY package.json .
RUN npm install
RUN npm install --save amqplib

COPY . .

USER node
EXPOSE 55554

CMD ["npm", "start"]