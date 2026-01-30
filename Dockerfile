# Hint: With node_version>=21.6.0 there are problems with debugging,
# therefore the development node version is set to 24 + in order to keep dev + prod versions aligned
# this was also reflected in the Dockerfile
ARG node_version=24

#stage1
FROM node:${node_version} as builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile

#stage 2
FROM node:${node_version}
ARG API_VERSION
ENV API_VERSION=${API_VERSION}
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/app/dist ./dist
ADD schema ./dist/schema
WORKDIR /usr/app/dist
CMD node ./index.js
EXPOSE 4000