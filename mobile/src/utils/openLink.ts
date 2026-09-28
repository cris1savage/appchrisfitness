import { Alert, Linking } from 'react-native';

/** Abre una URL externa sin romper la app si no hay app capaz de abrirla. */
export async function openLink(url?: string | null) {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo abrir el enlace', url);
  }
}
