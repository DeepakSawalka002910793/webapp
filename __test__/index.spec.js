const app = require('../server');
const request = require("supertest");


describe("GET /healthz22 ", () => {
  test("It should respond 200", async () => {
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});

