import { describe, it } from "node:test"
import { getUsernameFromEmail } from "./utils.js";
import { equal } from "node:assert";

describe('Test auth utils : ', () => { 
  it("should get the username from email", () => {
    const email = "test@example.com";
    const username = getUsernameFromEmail(email);

    equal(username, "test")
  })
})