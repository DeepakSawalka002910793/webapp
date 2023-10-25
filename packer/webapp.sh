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

# Create webapp directory under /home if it doesn't exist
echo "Creating webapp directory"
sudo mkdir -p /home/ec2-user

sudo cd /home/ec2-user

# Unzip the web application
echo "Unzipping the web application"
sudo unzip webapp.zip 


# Creating group and user for running the webapp
echo "Creating group and adding ec2 user"
sudo groupadd ec2-group
sudo useradd -s /bin/false -g ec2-group ec2-user


# Give ownership of the webapp directory to ec2-user
echo "Changing ownership of the webapp directory"
sudo chown -R ec2-user:ec2-group /home/ec2-user

# Navigate to the webapp directory and install node modules
echo "Installing node modules"
cd /home/ec2-user/webapp
sudo -u ec2-user npm install

# Copy the systemd service file
echo "Setting up the webapp service"
sudo cp /home/webapp/packer/webapp.service /etc/systemd/system
sudo chown ec2-user:ec2-group /etc/systemd/system/webapp.service
sudo chmod u+x /etc/systemd/system/webapp.service

# Start the service
echo "Starting the webapp service"
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl restart webapp

echo "Script executed successfully!"







