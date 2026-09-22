const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const supabasePath = path.resolve(__dirname, "../config/supabase.js");
const donationServicePath = path.resolve(__dirname, "../services/donationService.js");

function loadDonationService(mockSupabase) {
  delete require.cache[donationServicePath];
  require.cache[supabasePath] = { id: supabasePath, filename: supabasePath, loaded: true, exports: mockSupabase };
  return require(donationServicePath);
}

function queryResult(data, error = null) {
  return {
    eq() { return this; },
    maybeSingle: async () => ({ data, error }),
    select() { return this; },
    insert() { return this; },
    single: async () => ({ data, error })
  };
}

test("calculateSubscriptionDonation uses the configured percentage", () => {
  const service = loadDonationService({});
  assert.equal(service.calculateSubscriptionDonation(120, 25), 30);
  assert.equal(service.calculateSubscriptionDonation(99.99, 10), 10);
});

test("createSubscriptionDonation returns the existing contribution instead of inserting again", async () => {
  let insertCalled = false;
  const existing = { id: "donation-1", subscription_id: "subscription-1" };
  const mockSupabase = {
    from() {
      const query = queryResult(existing);
      query.insert = () => { insertCalled = true; return query; };
      return query;
    }
  };
  const service = loadDonationService(mockSupabase);
  const result = await service.createSubscriptionDonation({
    id: "subscription-1",
    user_id: "user-1",
    charity_id: "charity-1",
    amount: 100,
    charity_percentage: 10
  });

  assert.deepEqual(result, existing);
  assert.equal(insertCalled, false);
});
