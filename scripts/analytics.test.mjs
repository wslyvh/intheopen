import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const modulePath = path.join(process.cwd(), "src", "utils", "analytics.ts");

test("builds declarative Umami attributes for an outbound click", async () => {
  assert.equal(
    existsSync(modulePath),
    true,
    "expected the outbound analytics helper to exist",
  );

  const { outboundEvent } = await import(pathToFileURL(modulePath).href);
  assert.deepEqual(
    outboundEvent({
      target: "newsletter",
      placement: "work_card",
    }),
    {
      "data-umami-event": "outbound_click",
      "data-umami-event-target": "newsletter",
      "data-umami-event-placement": "work_card",
    },
  );
});

test("adds a label only when one is useful", async () => {
  assert.equal(existsSync(modulePath), true);
  const { outboundEvent } = await import(pathToFileURL(modulePath).href);

  assert.deepEqual(
    outboundEvent({
      target: "event",
      placement: "events_list",
      label: "Privacy Week",
    }),
    {
      "data-umami-event": "outbound_click",
      "data-umami-event-target": "event",
      "data-umami-event-placement": "events_list",
      "data-umami-event-label": "Privacy Week",
    },
  );
  assert.equal(
    "data-umami-event-label" in
      outboundEvent({ target: "twitter", placement: "footer" }),
    false,
  );
});
