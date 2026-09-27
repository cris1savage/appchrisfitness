import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim()||!password) { Alert.alert('Error','Rellena todos los campos'); return; }
    setLoading(true);
    try { await login(email,password); }
    catch (e) { Alert.alert('Error',e instanceof Error?e.message:'No se pudo iniciar sesión'); setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <View style={s.logoCircle}><Text style={s.logoTxt}>CF</Text></View>
            <Text style={s.brand}>Chris Fitness</Text>
            <Text style={s.tagline}>Tu plataforma de coaching</Text>
          </View>
          <View style={s.form}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" placeholderTextColor={Colors.textLight}/>
            <Text style={s.label}>Contraseña</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={handleLogin} placeholderTextColor={Colors.textLight}/>
            <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
              {loading?<ActivityIndicator color="#fff"/>:<Text style={s.btnTxt}>Entrar</Text>}
            </TouchableOpacity>
          </View>
          {__DEV__&&<Text style={s.hint}>Coach: chris@chrisfitness.com / 1234{'\n'}Cliente: carlos@test.com / 1234</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  container:{flexGrow:1,justifyContent:'center',padding:Spacing.lg},
  logo:{alignItems:'center',marginBottom:Spacing.xl},
  logoCircle:{width:80,height:80,borderRadius:20,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center',marginBottom:Spacing.md},
  logoTxt:{color:'#fff',fontSize:28,fontWeight:'800'},
  brand:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  tagline:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:4},
  form:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.lg,marginBottom:Spacing.md},
  label:{fontSize:FontSize.sm,color:Colors.textSecondary,fontWeight:'500',marginBottom:6,marginTop:Spacing.sm},
  input:{backgroundColor:Colors.background,borderRadius:Radius.md,padding:Spacing.md,fontSize:FontSize.md,color:Colors.text,borderWidth:1,borderColor:Colors.border},
  btn:{backgroundColor:Colors.primary,borderRadius:Radius.md,padding:Spacing.md,alignItems:'center',marginTop:Spacing.lg},
  btnTxt:{color:'#fff',fontSize:FontSize.md,fontWeight:'600'},
  hint:{textAlign:'center',fontSize:FontSize.xs,color:Colors.textLight,lineHeight:18},
});
