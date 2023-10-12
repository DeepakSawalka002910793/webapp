const app = require('../server');
const request = require("supertest");


describe("GET /healthz ", () => {
  test("It should respond 200", async () => {
    //expect.assertions(1); 
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});

