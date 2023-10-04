const app = require('../server');
const request = require("supertest");
//const sequelize = require('../config/dbSetup');


describe("GET /healthz ", () => {
  test("It should respond 200", async () => {
    //expect.assertions(1); 
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});

/* Closing the database connection after all tests have run
afterAll(async () => {
  await sequelize.close(); // This ensures that the DB connection is closed after tests
});*/