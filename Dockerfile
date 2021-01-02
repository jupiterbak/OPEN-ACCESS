FROM node:9

WORKDIR /app

COPY package.json .
RUN npm install
RUN npm install --save amqplib

COPY . .

USER node
EXPOSE 55554
EXPOSE 8090
# EXPOSE Additional Ports required by the nothbound and southbound modules

CMD ["npm", "start"]

