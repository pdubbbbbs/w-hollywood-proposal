# W Hollywood Proposal Website

This repository contains the website for the W Hollywood property proposal, styled to match the W Hotels brand aesthetic.

## Image Download Setup

This project uses the Unsplash API to download high-quality luxury real estate images for the property galleries. Follow these instructions to set up the image download functionality.

### 1. Getting an Unsplash API Key

1. Create a free account at [Unsplash](https://unsplash.com/join)
2. Once logged in, visit the [Unsplash Developer Portal](https://unsplash.com/developers)
3. Click on "Your Apps" and then "New Application"
4. Accept the API Terms and Guidelines
5. Fill in the application details:
   - Application name (e.g., "W Hollywood Proposal")
   - Description (e.g., "Website for luxury property proposal")
   - Select "Demo" for now (upgrade to Production if needed later)
6. After creating the app, you'll receive your Access Key and Secret Key
7. Copy your Access Key (also called Client ID) for use in the next step

### 2. Setting Up Environment Variables

#### On Windows:

1. Open PowerShell as administrator
2. Set your Unsplash API key as an environment variable:
   ```powershell
   [Environment]::SetEnvironmentVariable("UNSPLASH_ACCESS_KEY", "your-access-key-here", "User")
   ```
3. To make the variable available in your current session without restarting:
   ```powershell
   $env:UNSPLASH_ACCESS_KEY = "your-access-key-here"
   ```

#### On macOS/Linux:

1. Open Terminal
2. Add this line to your ~/.bash_profile or ~/.zshrc file:
   ```bash
   export UNSPLASH_ACCESS_KEY="your-access-key-here"
   ```
3. Reload your profile:
   ```bash
   source ~/.bash_profile  # or source ~/.zshrc
   ```

### 3. Running the Image Download Script

1. Make sure you have the environment variable set up as described above
2. Open PowerShell in the project root directory
3. Run the script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\get-images.ps1
   ```
4. The script will download images to the appropriate unit folders in the `images` directory
5. You should see progress information in the console

### 4. Troubleshooting Common Issues

#### API Rate Limiting

- Unsplash limits API requests to 50 per hour for demo applications
- If you receive a 429 error, wait an hour before trying again
- For higher limits, upgrade your Unsplash application to Production status

#### Script Execution Policy

- If you get execution policy errors in PowerShell, try:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
  Then run the script in the same PowerShell window

#### Image Download Failures

- Check your internet connection
- Verify your API key is correct
- Some specific images might be unavailable; the script will attempt to use alternates

#### Environment Variable Not Found

- If the script can't find your API key:
  1. Verify the variable is set correctly: `echo $env:UNSPLASH_ACCESS_KEY`
  2. Try restarting your PowerShell session
  3. Check if the variable is set at the correct scope (User or System)

## Further Development

After downloading the images, you'll need to:

1. Update HTML files with references to the downloaded images
2. Customize the rolodex gallery to showcase the property units
3. Update property details and descriptions

## License

The code in this repository is private and proprietary. The images downloaded from Unsplash are subject to [Unsplash's license](https://unsplash.com/license).

# W Hollywood Residences Proposal

## Project Overview
This repository contains a comprehensive proposal website for the W Hollywood Residences, with a particular focus on Unit 8A. The website is designed to showcase the unique features and investment value of three units: 12B, 10N, and 8A, with an emphasis on 8A as the premier choice.

## Site Structure
- **Home Page (`index.html`)**: Introduces W Hollywood Residences with comparison of Units
- **Unit Pages**:
  - `8A.html`: Featured unit with detailed specifications
  - `10N.html`: Comparison unit 
  - `12B.html`: Comparison unit
- **Financial Analysis (`finance.html`)**: Compares buying vs. leasing options
- **Personal Statement (`statement.html`)**: Articulates personal connection to the property

## Features
- Responsive design for all devices (mobile, tablet, desktop)
- Interactive financial calculators
- Image galleries with lazy loading
- Unit comparison tools
- Comprehensive amenities information
- Floor plans and layout descriptions
- Contact forms with validation

## Technical Details
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Interactivity**: Vanilla JavaScript for performance
- **Performance**: Optimized images and lazy loading
- **Security**: Comprehensive security headers and configuration

## Security Features
- SSL/TLS configuration
- Content Security Policy
- X-Frame-Options protection
- Referrer Policy
- Permissions Policy
- robots.txt and security.txt

## Progressive Web App Support
- Service worker for offline capability
- Web App Manifest
- Installable on mobile devices

## Getting Started

### Prerequisites
- Any modern web browser
- Git (for repository management)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/w-hollywood-proposal.git
   cd w-hollywood-proposal
   ```

2. Open `index.html` in your browser to view the site locally

### Deployment
The site is configured for deployment on Cloudflare Pages with enhanced security features.

## License
All rights reserved. This project and its contents are proprietary and confidential.

## Contact
For any inquiries, please contact [your-email@example.com](mailto:your-email@example.com)

