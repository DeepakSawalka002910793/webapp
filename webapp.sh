#!/bin/bash

# Update the system
sudo apt update -y
sudo apt upgrade -y

# Export database credentials and other env variables
export DBHOST="localhost"
export DBUSER="root"
export DBPASS="Root123#"
export DATABASE="csye_assign3"
export PORT=3000
export DBPORT=3306

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MariaDB
sudo apt-get install -y mariadb-server
sudo systemctl start mariadb

# Note: You should use a SQL command to create a new database, the below is a placeholder
# Create a new MySQL user and database
# Replace 'your_password' with the actual password, and 'your_database' with the actual database name
echo "CREATE DATABASE ${DATABASE}; GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${DBUSER}'@'${DBHOST}' IDENTIFIED BY '${DBPASS}'; FLUSH PRIVILEGES;" | sudo mysql

# Install unzip if not installed
sudo apt-get install unzip -y

# Unzip the web application
unzip webapp.zip -d webapp
cd webapp
npm install



