# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.15.1

FROM node:${NODE_VERSION}-slim AS build
LABEL fly_launch_runtime="Vite"
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git ca-certificates node-gyp pkg-config python-is-python3 && \
    update-ca-certificates && \
    corepack enable
COPY --link . /app
WORKDIR /app/packages/forge-react
RUN pnpm install && pnpm build
WORKDIR /app/sites/example
RUN pnpm install && pnpm build

FROM nginx
ENV NODE_ENV="production"
COPY --from=build /app/sites/example/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "/usr/sbin/nginx", "-g", "daemon off;" ]
