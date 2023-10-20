FROM node:lts

WORKDIR /app

COPY src/ /app/src
COPY package.json package-lock.json tsconfig.json .eslintrc.json /app/

RUN npm ci --ignore-scripts && npm run build

RUN echo "" > .env

CMD node /app/dist/index.js $ENV_FILE
