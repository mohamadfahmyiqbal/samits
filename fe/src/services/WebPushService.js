import { API_BASE_URL } from '../config/api';

const SERVICE_WORKER_PATH = '/service-worker.js';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

const fetchVapidPublicKey = async () => {
  const response = await fetch(`${API_BASE_URL}/push/public-key`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil VAPID public key (${response.status}).`);
  }

  const data = await response.json();
  return data?.publicKey || null;
};

const submitSubscription = async (subscription) => {
  const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ subscription }),
  });

  if (!response.ok) {
    throw new Error(`Gagal menyimpan subscription (${response.status}).`);
  }
};

let subscriptionAttempted = false;

export const registerAndSubscribeWebPush = async () => {
  if (subscriptionAttempted) {
    return;
  }
  subscriptionAttempted = true;

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  if (!localStorage.getItem('token')) {
    return;
  }

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) {
    return;
  }

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();

  if (permission !== 'granted') {
    return;
  }

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await submitSubscription(subscription.toJSON ? subscription.toJSON() : subscription);
};
