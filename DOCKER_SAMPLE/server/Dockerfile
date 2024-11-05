FROM node:16 as builder
WORKDIR /usr/app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:16
WORKDIR /usr/app
ENV NODE_ENV production
COPY --from=builder /usr/app/package.json .
RUN npm install --legacy-peer-deps
COPY --from=builder /usr/app/dist ./dist
CMD ["npm", "start"]

# Enter build process