const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.HOTMART_WEBHOOK_SECRET || "changeme";
const DB_FILE = path.resolve(__dirname, "subscribers.json");

function loadDatabase() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return { subscribers: [] };
  }
}

function saveDatabase(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function findSubscriber(db, email) {
  return db.subscribers.find((item) => item.email.toLowerCase() === email.toLowerCase());
}

function createOrUpdateSubscriber(db, email, payload) {
  let subscriber = findSubscriber(db, email);
  if (!subscriber) {
    subscriber = { email, active: false, plan: null, expiresAt: null, transactionId: null, updatedAt: null };
    db.subscribers.push(subscriber);
  }
  Object.assign(subscriber, payload, { email: email.toLowerCase(), updatedAt: new Date().toISOString() });
  return subscriber;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = loadDatabase();

  if (req.method === "POST" && url.pathname === "/api/hotmart/webhook") {
    const signature = req.headers["x-hotmart-signature"] || "";
    if (signature !== SECRET) {
      return sendJson(res, 403, { error: "Invalid webhook signature" });
    }

    try {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) {
        return sendJson(res, 400, { error: "Missing email" });
      }

      const event = String(body.event || "").toUpperCase();
      const isActive = event === "SUBSCRIPTION_APPROVED" || event === "SUBSCRIPTION_ACTIVE" || event === "SUBSCRIPTION_RENEWED";
      const isCancelled = event === "SUBSCRIPTION_CANCELLED" || event === "SUBSCRIPTION_EXPIRED";
      const payload = {
        active: isActive,
        plan: body.plan || body.product || "premium",
        expiresAt: body.expiresAt || null,
        transactionId: body.transactionId || body.transaction_id || null,
      };

      if (isCancelled) {
        payload.active = false;
      }

      createOrUpdateSubscriber(db, email, payload);
      saveDatabase(db);
      return sendJson(res, 200, { status: "ok", subscriber: findSubscriber(db, email) });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON payload" });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/subscription") {
    const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
    if (!email) {
      return sendJson(res, 400, { error: "Missing email parameter" });
    }
    const subscriber = findSubscriber(db, email);
    return sendJson(res, 200, { active: Boolean(subscriber?.active), subscriber: subscriber || null });
  }

  if (req.method === "GET" && url.pathname === "/api/subscribers") {
    return sendJson(res, 200, { subscribers: db.subscribers });
  }

  sendText(res, 404, "Not found");
});

server.listen(PORT, () => {
  console.log(`Hotmart subscription server running on http://localhost:${PORT}`);
  console.log(`Webhook secret: ${SECRET}`);
});
