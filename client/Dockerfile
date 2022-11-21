FROM node:16-alpine

WORKDIR /app

RUN chown -R node:node ./

COPY --chown=node:node package.json .

RUN npm install

COPY --chown=node:node . .

RUN npm run build

USER node

CMD ["npm", "start"]

EXPOSE 3005