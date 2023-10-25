#!/bin/bash
set -e  # This will cause the script to exit if any command returns a non-zero exit code

# Update the system
echo "Updating the system"
sudo apt update -y
sudo apt upgrade -y

# Install Node.js
echo "Installing Node.js"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install unzip if not installed
echo "Installing unzip"
sudo apt-get install unzip -y

# Unzip the web application
echo "Unzipping the web application"
unzip webapp.zip -d webapp

# Creating group and user for running the webapp
echo "Creating group and adding ec2 user"
sudo groupadd ec2-group
sudo useradd -s /bin/false -g ec2-group ec2-user

# Navigate to the webapp directory and install node modules
echo "Installing node modules"
cd /home/admin/webapp
npm install

# Copy the systemd service file
echo "Setting up the webapp service"
sudo cp /home/admin/webapp/packer/webapp.service /etc/systemd/system


# Give ownership of the webapp directory to ec2-user
echo "Changing ownership of the webapp directory"
sudo chown -R ec2-user:ec2-group /home/admin/webapp
sudo chown -R ec2-user:ec2-group /etc/systemd/system/webapp.service

# Start the service
echo "Starting the webapp service"
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl restart webapp

echo "Script executed successfully!"




