importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAPXeITeuLEZlh4MNNxz3NinR9xG-0GBGA",
  authDomain: "ahlis-pizza-notifications.firebaseapp.com",
  projectId: "ahlis-pizza-notifications",
  messagingSenderId: "885986596622",
  appId: "1:885986596622:web:d2a45e04e6aa718b73695f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png"
  });
});
