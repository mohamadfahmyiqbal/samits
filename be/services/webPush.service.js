import webpush from "web-push";
import crypto from "crypto";
import { db } from "../models/index.js";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@samit.local";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

let pushConfigured = false;
let storageReady = false;

const configureWebPush = () => {
  if (pushConfigured) {
    return true;
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured in environment variables");
    return false;
  }

  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    pushConfigured = true;
    console.log("WebPush configured successfully");
    return true;
  } catch (error) {
    console.error("Failed to configure WebPush:", error.message);
    return false;
  }
};

// ✅ NAMED EXPORTS (existing)
export const isWebPushConfigured = () => configureWebPush();
export const getPublicVapidKey = () => VAPID_PUBLIC_KEY;

const getSubscriptionModel = () => {
  const model = db.WebPushSubscription;
  if (!model) {
    throw new Error("Model WebPushSubscription belum siap.");
  }
  return model;
};

const ensureStorage = async () => {
  if (storageReady) return;
  const model = getSubscriptionModel();
  try {
    await model.sync();
  } catch (error) {
    console.warn("WebPushSubscription sync warning:", error.message);
  }
  storageReady = true;
};

const normalizeSubscription = (subscription = {}) => {
  const keys = subscription.keys || {};
  return {
    endpointHash: crypto
      .createHash("sha256")
      .update(subscription.endpoint || "")
      .digest("hex"),
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh || null,
    auth: keys.auth || null,
    contentEncoding: subscription.contentEncoding || null,
    rawSubscription: JSON.stringify(subscription),
  };
};

const toSubscriptionPayload = (record) => {
  try {
    const parsed = JSON.parse(record.rawSubscription || "{}");
    if (parsed?.endpoint) return parsed;
  } catch {}
  return {
    endpoint: record.endpoint,
    expirationTime: null,
    keys: { p256dh: record.p256dh, auth: record.auth },
  };
};

// NAMED EXPORTS
export const upsertSubscription = async (subscription, metadata = {}) => {
  if (!subscription?.endpoint) {
    throw new Error("Subscription endpoint tidak valid.");
  }
  await ensureStorage();
  const model = getSubscriptionModel();
  const normalized = normalizeSubscription(subscription);
  const values = {
    ...normalized,
    userNik: metadata.nik || null,
    userId: metadata.userId ? String(metadata.userId) : null,
    userPosition: metadata.position || null,
  };

  const existing = await model.findOne({
    where: { endpointHash: normalized.endpointHash },
  });
  if (existing) {
    await existing.update(values);
    return existing;
  }
  const created = await model.create(values);
  return created;
};

export const removeSubscription = async (endpoint) => {
  if (!endpoint) return false;
  await ensureStorage();
  const model = getSubscriptionModel();
  const endpointHash = crypto
    .createHash("sha256")
    .update(endpoint)
    .digest("hex");
  const affected = await model.destroy({ where: { endpointHash } });
  return affected > 0;
};

export const getSubscriptionStats = async () => {
  await ensureStorage();
  const model = getSubscriptionModel();
  const total = await model.count();
  return { total };
};

export const sendPushToAll = async (payload) => {
  if (!configureWebPush()) {
    throw new Error("Web Push belum dikonfigurasi. VAPID keys required.");
  }

  const message = JSON.stringify(payload || {});
  let successCount = 0,
    failedCount = 0;

  await ensureStorage();
  const model = getSubscriptionModel();
  const subscriptions = await model.findAll();

  for (const entry of subscriptions) {
    const subscription = toSubscriptionPayload(entry);
    const endpoint = entry.endpoint;

    try {
      await webpush.sendNotification(subscription, message);
      successCount++;
    } catch (error) {
      failedCount++;
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await removeSubscription(endpoint);
      }
    }
  }

  return {
    successCount,
    failedCount,
    totalAttempted: successCount + failedCount,
  };
};

// ✅ DEFAULT EXPORT WRAPPER (FIX ESM ERROR untuk workorder.service.js)
export default {
  sendNotification: sendPushToAll, // Alias untuk backward compat
  upsertSubscription,
  removeSubscription,
  getSubscriptionStats,
  isConfigured: isWebPushConfigured,
  getPublicKey: getPublicVapidKey,
};
