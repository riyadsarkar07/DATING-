import { NavigatorScreenParams } from '@react-navigation/native';
import { PublicUserSummary } from '../types/user';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  PhoneSignIn: undefined;
  OtpVerification: { verificationId: string; phoneNumber: string };
  EmailVerification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Matches: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  ProfileSetup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ChatRoom: { matchId: string };
  VoiceCall: { matchId: string; peer: PublicUserSummary; signalId?: string; direction: 'outgoing' | 'incoming' };
  VideoCall: { matchId: string; peer: PublicUserSummary; signalId?: string; direction: 'outgoing' | 'incoming' };
  CallHistory: undefined;
  MatchPopup: {
    matchId: string;
    candidateUid: string;
    candidateName: string;
    candidatePhotos: string[];
  };
  DiscoverFilters: undefined;
  ProfileDetail: { uid: string };
  EditProfile: undefined;
  VerificationRequest: undefined;
  Premium: { planId?: string } | undefined;
  Coins: undefined;
  DailyReward: undefined;
  LuckySpin: undefined;
  Boost: undefined;
  Notifications: undefined;
  Settings: undefined;
  Language: undefined;
  NotificationSettings: undefined;
  Privacy: undefined;
  Security: undefined;
  BlockedUsers: undefined;
  DeleteAccount: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  TicketDetail: { ticketId: string };
  Terms: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
};

export type CallRouteParams = {
  matchId: string;
  peer: PublicUserSummary;
  signalId?: string;
  direction: 'outgoing' | 'incoming';
};
