FROM node:21-alpine

WORKDIR /home/node/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD ["npm", "run", "web"]