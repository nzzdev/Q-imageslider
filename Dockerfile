# Use following version of Node as the base image
FROM node:9.3-slim

# Set work directory for run/cmd
WORKDIR /app

# Copy package.json into work directory and install dependencies
COPY package.json /app/package.json
RUN npm install --production

# Copy everthing else in work directory
COPY . /app

# Expose server port
EXPOSE 3000

# Run node
CMD node index.js
