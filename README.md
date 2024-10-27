This is a Node.js application that scrapes font styles and primary button styles from Shopify product pages. It uses TypeScript, Puppeteer, and Express to create an API endpoint that accepts a Shopify product page URL and returns JSON data containing the fonts and button styles used on that page.

Prerequisites

    Node.js (v12 or higher)
    npm (Node Package Manager) comes bundled with Node.js

Installation

    Clone the repository:

git clone https://github.com/oozan/shopify-scraper.git

Navigate to the project directory

cd shopify-scraper

Install the dependencies

    npm install

    This will install all required packages listed in the package.json file.

Usage
Compiling the TypeScript Code

The application is written in TypeScript and needs to be compiled to JavaScript before running.

    Compile the TypeScript code:

    npx tsc

    This command uses the TypeScript compiler to compile the code according to the settings in tsconfig.json. The compiled JavaScript files will be placed in the dist directory.

Running the Application

After compiling, you can run the application using Node.js

node dist/index.js

This will start the server on the port specified in the application (default is 3000)
