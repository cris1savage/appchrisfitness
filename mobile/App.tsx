import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Colors } from './src/constants/theme';

function Root() {
  const { user, restoring } = useAuth();
  if (restoring) return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:Colors.background}}>
      <ActivityIndicator color={Colors.primary} size="large"/>
    </View>
  );
  return user ? <MainNavigator/> : <LoginScreen/>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar style="dark"/>
          <Root/>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
