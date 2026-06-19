"use client";

import { useEffect, useRef } from "react";
import { getStoredToken, apiPost } from "@/lib/api";

const VAPID_PUBLIC_KEY = "BOicEHGkPOYb0frDJNzebhthy7ErHB5s_cHZl70oYXHE-j8bxMAv5mFaD_vrhmAesgnAvVFLUSxBFAiaS96_NZg";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

import toast from "react-hot-toast";

export default function PushNotificationManager() {
    const isRegistered = useRef(false);

    useEffect(() => {
        async function registerPush() {
            try {
                if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
                    return;
                }

                if (isRegistered.current) return;

                const token = getStoredToken();
                if (!token) return; // Only register if user is logged in
                
                isRegistered.current = true;

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error("Please allow your notification permission!");
                    return;
                }
                
                const register = await navigator.serviceWorker.register('/sw.js');
                console.log("Service Worker Registered...");

                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                // Send subscription to the backend using our existing api client
                await apiPost("/api/project-manager/notifications/subscribe", subscription);
                console.log("Device Subscribed Successfully!");
                
            } catch (error) {
                console.error("Error registering push notifications:", error);
            }
        }
        
        registerPush();
    }, []);

    return null;
}
