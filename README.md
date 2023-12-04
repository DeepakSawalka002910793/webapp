# Web Application Deployment
 
## Overview
 
This project outlines the process for deploying a secure web application in both development and demo environments, using AWS services and SSL certificates for security.
 
### Environments
 
- **Dev Environment**: Utilizes AWS Certificate Manager for SSL certificates.
- **Demo Environment**: SSL certificates are obtained from zeroSSL, imported into AWS Certificate Manager, and configured with a load balancer.
 
## CI/CD Workflow
 
### GitHub Actions Workflow
 
Triggered on Pull Request merge, it includes:
 
- Running unit tests.
- Validating Packer Template.
- Building Application Artifacts.
- Building AMI.
- Upgrading OS packages.
- Installing dependencies (Python, Node.js, etc.).
- Installing application dependencies (`pip install` for Python).
- Setting up the application (copying artifacts and configuration files).
- Configuring the application for automatic startup on VM launch.
- [NEW] Creating a new Launch Template version with the latest AMI for the auto-scaling group.
- [NEW] Issuing command to the auto-scale group for instance refresh using AWS CLI.
- [NEW] Ensuring GitHub Actions workflow waits for instance refresh completion.
 
### Security
 
- HTTP endpoints are secured with SSL certificates.
- Direct EC2 instance access is restricted.
 
## Importing SSL Certificate from CLI
 
To import an SSL certificate into AWS Certificate Manager, use the following command:
 
```bash
# Command to import the SSL certificate
Get-Content -Path "certificate.crt" | Set-Clipboard
Get-Content -Path "ca_bundle.crt" | Set-Clipboard
Get-Content -Path "private.key" | Set-Clipboard
```

