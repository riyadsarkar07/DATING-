import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList, AuthStackParamList } from './types';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { PhoneSignInScreen } from '../screens/auth/PhoneSignInScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { ProfileSetupWizard } from '../screens/profile-setup/ProfileSetupWizard';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { MatchesScreen } from '../screens/matches/MatchesScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ProfileTabScreen } from '../screens/profile/ProfileTabScreen';
import { ChatRoomScreen } from '../screens/chat/ChatRoomScreen';
import { VoiceCallScreen } from '../screens/call/VoiceCallScreen';
import { VideoCallScreen } from '../screens/call/VideoCallScreen';
import { CallHistoryScreen } from '../screens/call/CallHistoryScreen';
import { MatchPopupScreen } from '../screens/matches/MatchPopupScreen';
import { DiscoverFiltersScreen } from '../screens/discover/DiscoverFiltersScreen';
import { ProfileDetailScreen } from '../screens/profile/ProfileDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { VerificationRequestScreen } from '../screens/profile/VerificationRequestScreen';
import { PremiumScreen } from '../screens/premium/PremiumScreen';
import { CoinsScreen } from '../screens/premium/CoinsScreen';
import { DailyRewardScreen } from '../screens/premium/DailyRewardScreen';
import { LuckySpinScreen } from '../screens/premium/LuckySpinScreen';
import { BoostScreen } from '../screens/premium/BoostScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LanguageScreen } from '../screens/settings/LanguageScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { SecurityScreen } from '../screens/settings/SecurityScreen';
import { BlockedUsersScreen } from '../screens/settings/BlockedUsersScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { HelpCenterScreen } from '../screens/settings/HelpCenterScreen';
import { ContactSupportScreen } from '../screens/settings/ContactSupportScreen';
import { TicketDetailScreen } from '../screens/settings/TicketDetailScreen';
import { TermsScreen } from '../screens/settings/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/settings/PrivacyPolicyScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, [string, string]> = {
  Home: ['home-outline', 'home'],
  Discover: ['compass-outline', 'compass'],
  Matches: ['heart-outline', 'heart'],
  Chat: ['chatbubble-ellipses-outline', 'chatbubble-ellipses'],
  Profile: ['person-outline', 'person'],
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0B0B12',
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Poppins_500Medium',
        },
        tabBarIcon: ({ color, size }) => {
          const [outline, filled] = TAB_ICONS[route.name];
          return <Ionicons name={color === '#8B5CF6' ? (filled as any) : (outline as any)} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0B12' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupWizard} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="VoiceCall" component={VoiceCallScreen} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} />
      <Stack.Screen name="CallHistory" component={CallHistoryScreen} />
      <Stack.Screen name="MatchPopup" component={MatchPopupScreen} />
      <Stack.Screen name="DiscoverFilters" component={DiscoverFiltersScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="VerificationRequest" component={VerificationRequestScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="Coins" component={CoinsScreen} />
      <Stack.Screen name="DailyReward" component={DailyRewardScreen} />
      <Stack.Screen name="LuckySpin" component={LuckySpinScreen} />
      <Stack.Screen name="Boost" component={BoostScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0B12' } }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
      <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </AuthStack.Navigator>
  );
}
