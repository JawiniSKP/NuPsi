// src/environments/environment.prod.ts
export const environment = {
  production: true,

  firebaseConfig: {
    apiKey: "AIzaSyCXD3bLDnJAnhUlC_H5CjRNdAcrjf0bdgk",
    authDomain: "nupsi-app.firebaseapp.com",
    projectId: "nupsi-app",
    storageBucket: "nupsi-app.appspot.com",
    messagingSenderId: "1097015901539",
    appId: "1:1097015901539:web:fefe10dad49ba223d36756"
  },

  // 👇 URL de Render en PRODUCCIÓN (Rasa)
  rasaUrl: "https://capstone-rasa.onrender.com/webhooks/rest/webhook"
};
