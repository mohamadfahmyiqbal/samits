import {
  getPublicVapidKey,
  getSubscriptionStats,
  isWebPushConfigured,
  sendPushToAll,
  upsertSubscription
} from '../../services/webPush.service.js';
import { emitToAllClients } from '../../services/realtime.service.js';

export const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body || {};

    if (!subscription?.endpoint) {
      return res.status(400).json({ message: 'Payload subscription tidak valid.' });
    }

    const metadata = {
      nik: req.user?.nik || null,
      userId: req.user?.id || null,
      position: req.user?.position || null
    };

    await upsertSubscription(subscription, metadata);

    return res.status(201).json({
      message: 'Subscription Web Push berhasil disimpan.',
      stats: await getSubscriptionStats(),
      webPushConfigured: isWebPushConfigured()
    });
  } catch (error) {
    console.error('Error in subscribePush:', error);
    return res.status(500).json({
      message: 'Gagal menyimpan subscription Web Push.',
      error: error.message
    });
  }
};

export const sendPushBroadcast = async (req, res) => {
  try {
    const { title, body, url, data } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ message: 'Field title dan body wajib diisi.' });
    }

    const payload = {
      title,
      body,
      data: {
        ...data,
        url: url || '/'
      }
    };

    const result = await sendPushToAll(payload);

    emitToAllClients('notification:broadcast', {
      ...payload,
      sentAt: new Date().toISOString(),
      sender: req.user?.nik || 'system'
    });

    return res.status(200).json({
      message: 'Push notification broadcast selesai diproses.',
      result
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Gagal mengirim push notification.',
      error: error.message
    });
  }
};

export const getPushStatus = async (_req, res) => {
  return res.status(200).json({
    webPushConfigured: isWebPushConfigured(),
    stats: await getSubscriptionStats()
  });
};

export const getPushPublicKey = async (_req, res) => {
  const publicKey = getPublicVapidKey();
  return res.status(200).json({
    publicKey,
    configured: isWebPushConfigured()
  });
};
