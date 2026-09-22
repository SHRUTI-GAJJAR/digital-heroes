const test = require("node:test");
const assert = require("node:assert/strict");

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.JWT_SECRET = "test-jwt-secret";

const adminOnly = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("adminOnly rejects missing authentication", () => {
  const response = responseRecorder();
  adminOnly({}, response, () => assert.fail("next should not run"));
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, "Authentication required");
});

test("adminOnly rejects non-admin users", () => {
  const response = responseRecorder();
  adminOnly({ user: { role: "user" } }, response, () => assert.fail("next should not run"));
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, "Admin access required");
});

test("adminOnly allows admin users", () => {
  let called = false;
  adminOnly({ user: { role: "admin" } }, responseRecorder(), () => { called = true; });
  assert.equal(called, true);
});

test("protect rejects missing bearer tokens", async () => {
  const response = responseRecorder();
  await protect({ headers: {} }, response, () => assert.fail("next should not run"));
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, "Not authorized. Token required.");
});

test("protect rejects malformed tokens before database access", async () => {
  const response = responseRecorder();
  await protect({ headers: { authorization: "Bearer not-a-jwt" } }, response, () => assert.fail("next should not run"));
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, "Invalid or expired token");
});
