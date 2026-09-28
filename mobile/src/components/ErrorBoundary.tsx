import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

type State = { error: Error | null };

/** Evita la pantalla en blanco / cierre de la app si una pantalla lanza un error al renderizar. */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Aquí se puede enviar a Sentry / Crashlytics
    console.error('Error no controlado', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={s.wrap}>
        <Text style={s.tit}>Algo ha ido mal</Text>
        <Text style={s.msg}>{this.state.error.message}</Text>
        <TouchableOpacity style={s.btn} onPress={() => this.setState({ error: null })}>
          <Text style={s.btnTxt}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, backgroundColor: Colors.background },
  tit: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  msg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  btnTxt: { color: '#fff', fontWeight: '600', fontSize: FontSize.md },
});
