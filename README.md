# webapp
Creating a api request using Nodejs and MariaDB and checking it in POSTMAN.

Prerequisites 1.Visual studio code 2.POSTMAN 3.Database - Maria.DB 4.Node.js

Dependencies to be installed npm i start app by npm start Important Commands to run the server and test Scripts npm start: starts the development server jest test: runs test suite Endpoints The following endpoints are available for operations:

authenticated: Operations available only to authenticated users

GET - http://localhost:3000/v1/assignments

POST - http://localhost:3000/v1/assignments

PUT - http://localhost:3000/v1/assignments/{id}

GET - http://localhost:3000/v1/assignments/{id}

DELETE - http://localhost:3000/v1/assignments/{id}

Publc: Operations available to all users without authentication

GET - http://localhost:3000/healthz

Responds with following HTTP messages "200 OK - The request was successful."

"201 Created - A new resource was created as a result of the request, often sent in response to a POST or some PUT requests."

"204 No Content - The request was successful, but there's no need for the client to navigate away from its current page."

"400 Bad Request - The server could not process the request due to an invalid syntax."

"401 Unauthenticated - The client must provide authentication to receive the requested response."

"403 Forbidden - The client does not have access to the requested resource."

"404 - Not Found"

"500 Internal Server Error - The server encountered an issue it couldn't handle."

Instructions:

Step 1: Clone the repository or download and unzip the source repository.

Step 2: Create appropriate files in the IDE and write the code to test the API call in Postman.

Step 3: Open Postman to Test the API's

Step 4: Check the Database after each and every API is called to see the status in Database.

Test the api with the above HTTPs status code.

Please create a pull request with a detailed description of changes.
