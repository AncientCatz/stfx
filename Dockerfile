FROM node:12.7.0-buster-slim
COPY pack/package.json /
COPY pack/package-lock.json /
RUN npm install pug-cli
RUN npm install
ENV PATH="/node_modules/.bin/:${PATH}"
