const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requiredFields = [
  "title",
  "category",
  "description",
  "offerUrl",
  "discount",
  "contactName",
  "contactEmail",
];

export async function POST(request: Request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: "Please check the submitted fields." },
      { status: 400 },
    );
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return Response.json(
      { error: "Please check the submitted fields." },
      { status: 400 },
    );
  }
  const fields = Object.fromEntries(
    [...requiredFields, "couponCode"].map((name) => [
      name,
      typeof input[name] === "string" ? input[name].trim() : "",
    ]),
  );
  let validUrl = false;
  try {
    validUrl = ["https:", "http:"].includes(new URL(fields.offerUrl).protocol);
  } catch {
    // An invalid URL is rejected below.
  }
  if (
    requiredFields.some((name) => !fields[name]) ||
    !emailPattern.test(fields.contactEmail) ||
    !validUrl
  ) {
    return Response.json(
      {
        error:
          "Fill in all required fields and use a valid email and offer link.",
      },
      { status: 400 },
    );
  }

  const from = process.env.DEAL_SUBMISSIONS_FROM?.trim() ?? "";
  const to = process.env.DEAL_SUBMISSIONS_TO?.trim() ?? "";
  const key = process.env.IMPROVMX_API_KEY;
  if (
    !key ||
    !emailPattern.test(from) ||
    !emailPattern.test(to) ||
    from.toLowerCase() === to.toLowerCase()
  ) {
    return Response.json(
      { error: "Submissions are temporarily unavailable." },
      { status: 503 },
    );
  }
  const [alias, domain] = from.split("@");
  const text = [
    `Title: ${fields.title}`,
    `Category: ${fields.category}`,
    `Short description: ${fields.description}`,
    `Offer link: ${fields.offerUrl}`,
    `Discount: ${fields.discount}`,
    `Coupon code: ${fields.couponCode || "None"}`,
    `Contact name (not for publication): ${fields.contactName}`,
    `Contact email (not for publication): ${fields.contactEmail}`,
  ].join("\n\n");
  try {
    const response = await fetch(
      `https://api.improvmx.com/v4/domains/${encodeURIComponent(domain)}/emails/outbound`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: alias,
          to,
          reply_to: fields.contactEmail,
          subject: "In the Open: deal submission",
          text,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (response.ok) return Response.json({ ok: true });
  } catch {
    // Keep provider responses, contact details and credentials out of logs and responses.
  }
  return Response.json(
    { error: "Could not send your submission. Please try again later." },
    { status: 502 },
  );
}
