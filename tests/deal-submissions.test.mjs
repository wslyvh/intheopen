import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

beforeEach((t) => {
  for (const [name, value] of Object.entries({
    IMPROVMX_API_KEY: "test-key",
    DEAL_SUBMISSIONS_FROM: "website@example.org",
    DEAL_SUBMISSIONS_TO: "agent@example.org",
  })) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
});

const valid = {
  title: "Privacy project",
  category: "Email",
  description: "An encrypted email service.",
  offerUrl: "https://example.org/offer",
  discount: "30% off your first year",
  couponCode: "PRIVATE30",
  contactName: "Test contact",
  contactEmail: "contact@example.org",
  to: "not-the-recipient@example.org",
  from: "not-the-sender@example.org",
};

function request(body) {
  return new Request("https://www.intheopen.cc/api/deal-submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("forwards fields as plain text using only the configured sender and recipient", async (t) => {
  const { POST } = await import("../src/app/api/deal-submissions/route.ts");

  const send = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(
      url,
      "https://api.improvmx.com/v4/domains/example.org/emails/outbound",
    );
    assert.equal(
      options.headers.Authorization,
      `Basic ${Buffer.from("api:test-key").toString("base64")}`,
    );
    const mail = JSON.parse(options.body);
    assert.equal(mail.from, "website");
    assert.equal(mail.to, "agent@example.org");
    assert.equal(mail.reply_to, valid.contactEmail);
    for (const field of [
      "title",
      "category",
      "description",
      "offerUrl",
      "discount",
      "couponCode",
      "contactName",
      "contactEmail",
    ]) {
      assert.ok(mail.text.includes(valid[field]), field);
    }
    assert.equal(mail.html, undefined);
    return Response.json({ id: "private-provider-id" });
  });
  const response = await POST(request(valid));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(send.mock.callCount(), 1);
});

test("rejects empty fields, malformed requests and invalid contact or offer links without sending", async (t) => {
  const { POST } = await import("../src/app/api/deal-submissions/route.ts");
  const send = t.mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  const invalid = [
    null,
    [],
    { ...valid, title: " " },
    { ...valid, contactEmail: "not-an-email" },
    { ...valid, offerUrl: "javascript:alert(1)" },
  ];
  for (const body of invalid)
    assert.equal((await POST(request(body))).status, 400);
  assert.equal(
    (
      await POST(
        new Request("https://example.org", { method: "POST", body: "{" }),
      )
    ).status,
    400,
  );
  assert.equal(send.mock.callCount(), 0);
});

test("does not send from the receiving address and keeps transport failures private", async (t) => {
  const { POST } = await import("../src/app/api/deal-submissions/route.ts");
  let rejected = true;
  const send = t.mock.method(globalThis, "fetch", async () => {
    if (rejected)
      return Response.json(
        { error: "private provider detail" },
        { status: 403 },
      );
    throw new Error("private transport detail");
  });
  process.env.DEAL_SUBMISSIONS_FROM = process.env.DEAL_SUBMISSIONS_TO;
  assert.equal((await POST(request(valid))).status, 503);
  assert.equal(send.mock.callCount(), 0);
  process.env.DEAL_SUBMISSIONS_FROM = "website@example.org";
  const rejection = await POST(request(valid));
  assert.equal(rejection.status, 502);
  assert.ok(!(await rejection.text()).includes("private provider detail"));
  rejected = false;
  const response = await POST(request(valid));
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("private transport detail"));
  assert.equal(send.mock.callCount(), 2);
});
