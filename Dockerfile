# Stage 1: Build
FROM node:21 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./

# Define build-time arguments
ARG VITE_API_URL
ARG VITE_TOKEN_KEY
ARG VITE_REFRESH_TOKEN_KEY

# Use the arguments in the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TOKEN_KEY=$VITE_TOKEN_KEY
ENV VITE_REFRESH_TOKEN_KEY=$VITE_REFRESH_TOKEN_KEY

# Run the build process (Vite reads these variables)
RUN yarn build

# Stage 2: Serve
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80