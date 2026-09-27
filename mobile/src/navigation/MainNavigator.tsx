import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

import HomeScreen from '../screens/cliente/HomeScreen';
import WorkoutScreen from '../screens/cliente/WorkoutScreen';
import NutricionScreen from '../screens/cliente/NutricionScreen';
import ProgresoScreen from '../screens/cliente/ProgresoScreen';
import PerfilScreen from '../screens/cliente/PerfilScreen';

import ClientesScreen from '../screens/coach/ClientesScreen';
import CheckinsScreen from '../screens/coach/CheckinsScreen';
import EjerciciosScreen from '../screens/coach/EjerciciosScreen';

export type ClienteTabsParams = {
  Inicio: undefined;
  Entreno: undefined;
  'Nutrición': undefined;
  Progreso: undefined;
  Perfil: { abrirCheckin?: boolean; ts?: number } | undefined;
};

const Tab = createBottomTabNavigator<ClienteTabsParams>();
const CoachTab = createBottomTabNavigator();

function ClienteTabs() {
  return (
    <Tab.Navigator screenOptions={({route})=>({
      headerShown:false,
      tabBarActiveTintColor:Colors.primary,
      tabBarInactiveTintColor:Colors.textLight,
      tabBarStyle:{borderTopColor:Colors.border,backgroundColor:Colors.card},
      tabBarLabelStyle:{fontSize:11,fontWeight:'500'},
      tabBarIcon:({color,size})=>{
        const icons:Record<string,keyof typeof Ionicons.glyphMap>={Inicio:'home-outline',Entreno:'barbell-outline','Nutrición':'nutrition-outline',Progreso:'stats-chart-outline',Perfil:'person-outline'};
        return <Ionicons name={icons[route.name]} size={size} color={color}/>;
      },
    })}>
      <Tab.Screen name="Inicio" component={HomeScreen}/>
      <Tab.Screen name="Entreno" component={WorkoutScreen}/>
      <Tab.Screen name="Nutrición" component={NutricionScreen}/>
      <Tab.Screen name="Progreso" component={ProgresoScreen}/>
      <Tab.Screen name="Perfil" component={PerfilScreen}/>
    </Tab.Navigator>
  );
}

function CoachTabs() {
  return (
    <CoachTab.Navigator screenOptions={({route})=>({
      headerShown:false,
      tabBarActiveTintColor:Colors.primary,
      tabBarInactiveTintColor:Colors.textLight,
      tabBarStyle:{borderTopColor:Colors.border,backgroundColor:Colors.card},
      tabBarLabelStyle:{fontSize:11,fontWeight:'500'},
      tabBarIcon:({color,size})=>{
        const icons:Record<string,keyof typeof Ionicons.glyphMap>={Clientes:'people-outline','Check-ins':'clipboard-outline',Ejercicios:'barbell-outline'};
        return <Ionicons name={icons[route.name]} size={size} color={color}/>;
      },
    })}>
      <CoachTab.Screen name="Clientes" component={ClientesScreen}/>
      <CoachTab.Screen name="Check-ins" component={CheckinsScreen}/>
      <CoachTab.Screen name="Ejercicios" component={EjerciciosScreen}/>
    </CoachTab.Navigator>
  );
}

export default function MainNavigator() {
  const { isCoach } = useAuth();
  return (
    <NavigationContainer>
      {isCoach ? <CoachTabs/> : <ClienteTabs/>}
    </NavigationContainer>
  );
}
