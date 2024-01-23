FROM node:lts-alpine

WORKDIR /app

COPY src/ /app/src
COPY scripts/ /app/scripts
COPY package.json package-lock.json tsconfig.json .eslintrc.json /app/

RUN npm ci --ignore-scripts && npm rebuild --platform=linux --libc=musl sharp && npm run build --ignore-scripts

RUN echo "" > .env

USER node

CMD node /app/dist/index.js "$ENV_FILE"
