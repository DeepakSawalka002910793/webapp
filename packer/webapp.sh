#!/bin/bash

# Update the system
sudo apt update -y
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install unzip if not installed
sudo apt-get install unzip -y

# Unzip the web application
unzip webapp.zip -d webapp
cd webapp
npm install

sudo cp webapp.service /etc/systemd/system
systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service



