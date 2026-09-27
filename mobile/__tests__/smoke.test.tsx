import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

// Recorre la app como lo haría un usuario: si alguna pantalla lanza un error al
// renderizar (p. ej. texto fuera de <Text>), el test falla.
async function login(email: string) {
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('tu@email.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), '1234');
  await fireEvent.press(screen.getByText('Entrar'));
}

async function visitarTabs(tabs: string[], esperado: Record<string, string>) {
  for (const tab of tabs) {
    await fireEvent.press(screen.getAllByText(tab).at(-1)!);
    expect(await screen.findAllByText(esperado[tab] ?? tab)).not.toHaveLength(0);
  }
}

beforeEach(async () => { await AsyncStorage.clear(); });

test('login incorrecto muestra error y no entra', async () => {
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('tu@email.com'), 'nadie@test.com');
  await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'mal');
  await fireEvent.press(screen.getByText('Entrar'));
  expect(await screen.findByText('Entrar')).toBeTruthy();
});

test('cliente: todas las pantallas renderizan', async () => {
  await login('carlos@test.com');
  expect(await screen.findByText(/Hola, Carlos/)).toBeTruthy();
  await visitarTabs(['Entreno', 'Nutrición', 'Progreso', 'Perfil'], {
    Entreno: 'Entrenamientos', 'Nutrición': 'Plan', Progreso: 'Evolución del peso', Perfil: 'Enviar check-in semanal',
  });
  // Entreno completo: iniciar rutina y abrir el registro de serie
  await fireEvent.press(screen.getAllByText('Entreno').at(-1)!);
  await fireEvent.press((await screen.findAllByText('Iniciar'))[0]);
  expect(await screen.findByText('PRESS BANCA')).toBeTruthy();
  await fireEvent.press(screen.getAllByText('Registrar')[0]);
  expect(await screen.findByText('Confirmar')).toBeTruthy();
});

test('coach: todas las pantallas renderizan y el buscador ignora tildes', async () => {
  await login('chris@chrisfitness.com');
  expect(await screen.findByText('Mis clientes')).toBeTruthy();
  await visitarTabs(['Calendario', 'Rutinas', 'Ejercicios'], { Ejercicios: 'Press plano con mancuernas' });
  await fireEvent.changeText(screen.getByPlaceholderText('Buscar ejercicio...'), 'jalon');
  expect(await screen.findByText('Jalón al pecho')).toBeTruthy();
});

test('la sesión se restaura al reabrir la app', async () => {
  await login('alvaro@test.com');
  expect(await screen.findByText(/Hola, Álvaro/)).toBeTruthy();
  screen.unmount();
  await render(<App />);
  expect(await screen.findByText(/Hola, Álvaro/)).toBeTruthy();
});
