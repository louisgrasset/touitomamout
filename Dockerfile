FROM node:lts

RUN groupadd --system bot \
    &&  useradd --system bot -g bot

WORKDIR /app

COPY src/ /app/src
COPY scripts/ /app/scripts
COPY package.json package-lock.json tsconfig.json .eslintrc.json /app/

RUN npm run prebuild
RUN npm ci --ignore-scripts && npm rebuild --platform=linux --arch=x64 --libc=glibc sharp && npm run build

RUN echo "" > .env

USER bot

CMD node /app/dist/index.js "$ENV_FILE"
