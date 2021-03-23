FROM node:14-alpine
WORKDIR /server
COPY . .
RUN yarn install && yarn build
CMD [ "yarn", "start:prod" ]