// Initialize firestore with admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./yurie-s-api-firebase-adminsdk-l0y9d-d3907685b0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://yurie-s-api.firebaseio.com"
});

module.exports = { 
    admin
}