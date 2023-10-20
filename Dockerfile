FROM node:lts

RUN groupadd --system bot \
    &&  useradd --system bot -g bot

WORKDIR /app

COPY src/ /app/src
COPY package.json package-lock.json tsconfig.json .eslintrc.json /app/

RUN npm ci --ignore-scripts && npm run build

RUN echo "" > .env

USER bot

CMD node /app/dist/index.js $ENV_FILE
