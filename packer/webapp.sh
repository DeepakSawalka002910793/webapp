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

# Secure the installation, remove anonymous users, disallow remote root login, and remove test database
sudo mysql_secure_installation

# Log in to MariaDB to create the user (if not exists), change the password, create a database, set permissions, and use the new database
sudo mysql -u root -p <<EOF
CREATE USER IF NOT EXISTS 'root'@'localhost';
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DBPASS}';
CREATE DATABASE IF NOT EXISTS ${DATABASE};
GRANT ALL PRIVILEGES ON ${DATABASE}.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
USE ${DATABASE};
EXIT;
EOF


#sudo mysqladmin -u ${DBUSER} password ${DBPASS}
#mysqladmin -u ${DBUSER} --password=${DBPASS} --host=${DBHOST} --port=${DBPORT} create ${DATABASE}
sudo systemctl enable mariadb

# Install unzip if not installed
sudo apt-get install unzip -y

# Unzip the web application
unzip webapp.zip -d webapp
cd webapp
npm install


