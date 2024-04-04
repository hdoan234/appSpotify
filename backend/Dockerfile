FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

ENV DATABASE_URL=mongodb+srv://hungbui:hungbui@cluster0.mwpinhd.mongodb.net/spot

COPY . .

EXPOSE 3000

RUN npx prisma db push

CMD ["npm", "run", "dev"]