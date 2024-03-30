FROM node:21-alpine

WORKDIR /home/node/frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g @ionic/cli

EXPOSE 8100

CMD ["ionic", "serve", "--host=0.0.0.0"]