# Use an official Node.js runtime as a parent image
FROM node:22.1.0

# Set the Node.js memory limit
ENV NODE_OPTIONS=--max-old-space-size=4096

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build your application (if applicable)
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start your application
CMD ["npm", "start"]
