const app = require('../server');
const request = require("supertest");
const helper = require('../config/helper')

describe("GET /healthz ", () => {

  test("It should respond 200", async () => {    
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});

afterAll(done => {
  // Close the statsdClient socket to clean up the open handle
  helper.statsdClient.close();
  done(); // Call done to signal Jest that the cleanup is complete
});

