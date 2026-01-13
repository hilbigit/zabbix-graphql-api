# Hint: With node_version>=21.6.0 there are problems with debugging,
# therefore the development node version is set to 21.5.0 + in order to keep dev + prod versions aligned
# this was also reflected in the Dockerfile
ARG node_version=21.5.0

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
COPY extensions ./
RUN npm install --production

COPY --from=builder /usr/app/dist ./dist

CMD node dist/index.js
EXPOSE 4000