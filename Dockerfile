# Stage 1: Build the React app
FROM node:18-alpine3.17 as build

WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install

# Increase Node.js memory limit during build

# Stage 2: Serve the app using Nginx
FROM ubuntu

RUN apt-get update && apt-get install nginx -y

# Copy the built React app from the first stage
COPY --from=build /app/dist /var/www/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
