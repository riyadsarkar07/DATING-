import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';
import 'firebase/compat/analytics';
import { firebaseConfig } from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { default as firebase } from 'firebase/compat/app';
export { default as auth } from 'firebase/compat/auth';
export { default as firestore } from 'firebase/compat/firestore';
export { default as storage } from 'firebase/compat/storage';
export { default as functions } from 'firebase/compat/functions';
export * as analytics from './analytics.web';
export * as crashlytics from './crashlytics.web';
export * as messaging from './messaging.web';
