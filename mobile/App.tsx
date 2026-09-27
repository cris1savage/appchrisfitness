import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Colors } from './src/constants/theme';
import { isSupabaseConfigured } from './src/lib/supabase';

function FaltaConfiguracion() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:24,backgroundColor:Colors.background}}>
      <Text style={{fontSize:18,fontWeight:'700',color:Colors.text,marginBottom:8}}>Falta configurar Supabase</Text>
      <Text style={{fontSize:14,color:Colors.textSecondary,textAlign:'center'}}>
        Copia mobile/.env.example como mobile/.env, rellena EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY y reinicia con "npx expo start -c".
      </Text>
    </View>
  );
}

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
        <StatusBar style="dark"/>
        {isSupabaseConfigured ? (
          <AuthProvider>
            <Root/>
          </AuthProvider>
        ) : <FaltaConfiguracion/>}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
