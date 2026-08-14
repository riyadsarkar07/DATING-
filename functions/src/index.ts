import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './admin';
export * from './security';
export * from './moderation';
export * from './support';
export * from './verification';
export * from './notifications';
export * from './matching';
