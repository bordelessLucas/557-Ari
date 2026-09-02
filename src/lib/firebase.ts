import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBGrRhD76syviAy2MV8Z6bSkbLfMjobH0Y',
  authDomain: 'ari-b0f40.firebaseapp.com',
  projectId: 'ari-b0f40',
  storageBucket: 'ari-b0f40.firebasestorage.app',
  messagingSenderId: '773220642535',
  appId: '1:773220642535:web:4b8f2f88179288b6e07c42',
  measurementId: 'G-990HHDX2SC',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app)
  }
})
