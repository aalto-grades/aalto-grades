FROM node:16-alpine

WORKDIR /app

COPY . .

RUN chown -R node:node ./

USER node

RUN npm install

RUN chown -R node:node ./

RUN npm run build

CMD ["npm", "start"]

EXPOSE 3005
