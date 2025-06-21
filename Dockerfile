
FROM node:18-alpine as build


WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN sed -i 's/"build": "tsc && vite build"/"build": "vite build"/g' package.json

RUN NODE_ENV=production pnpm build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 6801

CMD ["nginx", "-g", "daemon off;"]
