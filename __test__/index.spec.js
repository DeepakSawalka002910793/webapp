const app = require('../server');
const request = require("supertest");


describe("GET /healthz ", () => {
  test("It should respond 200", async () => {
    //expect.assertions(1); 
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });


// Add a negative test case to fail the workflow when the response is not 200
test("It should fail with status other than 200", async () => {
  const response = await request(app).get("/healthz");
  expect(response.statusCode).not.toBe(200); // Fails if status code is 200
});
});


