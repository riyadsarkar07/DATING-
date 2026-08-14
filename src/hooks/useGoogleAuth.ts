import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useState } from 'react';
import { googleConfig } from '../firebase/config';
import { authService } from '../services/auth.service';
import { getErrorMessage } from '../core/errors/FirebaseErrorMessage';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleConfig.webClientId,
    clientId: googleConfig.webClientId,
  });

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await promptAsync();
      if (result?.type !== 'success') return;
      const idToken = result.authentication?.idToken;
      if (!idToken) throw new Error('Google sign-in did not return a token.');
      await authService.handleGoogleLogin(idToken);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, disabled: !request };
}
