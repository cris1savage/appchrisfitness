import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as api from '../src/lib/api';
import * as fx from '../test/fixtures';
import App from '../App';

jest.mock('../src/lib/supabase', () => ({ isSupabaseConfigured: true, supabase: {} }));
jest.mock('../src/config', () => ({ WEB_URL: 'https://app.test', CONTACT_EMAIL: 'hola@test.com' }));
jest.mock('../src/lib/api', () => {
  const actual = jest.requireActual('../src/lib/api');
  return {
    optionTotals: actual.optionTotals,
    getSessionUserId: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), onSignedOut: jest.fn(() => () => {}),
    loadSessionUser: jest.fn(), fetchActiveBlock: jest.fn(), fetchMyLogs: jest.fn(), logSet: jest.fn(),
    fetchActivePlan: jest.fn(), chooseOption: jest.fn(), fetchProgress: jest.fn(), logWeight: jest.fn(),
    uploadProgressPhoto: jest.fn(), fetchMyCheckins: jest.fn(), submitCheckin: jest.fn(),
    fetchClients: jest.fn(), fetchRecentResponses: jest.fn(), fetchExercises: jest.fn(),
  };
});

const m = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
  m.getSessionUserId.mockResolvedValue(null);
  m.signIn.mockResolvedValue();
  m.fetchActiveBlock.mockResolvedValue(fx.block);
  m.fetchMyLogs.mockResolvedValue([{ training_exercise_id: 'te1', logged_at: '2026-09-20', weight: 60, reps: 8 }]);
  m.logSet.mockResolvedValue();
  m.fetchActivePlan.mockResolvedValue(fx.plan);
  m.chooseOption.mockResolvedValue();
  m.fetchProgress.mockResolvedValue({ goal: { start_weight: 90, target_weight: 82, start_date: null, target_date: null }, logs: [
    { logged_at: '2026-09-01', weight: 90 }, { logged_at: '2026-09-15', weight: 87.5 },
  ] });
  m.logWeight.mockResolvedValue();
  m.fetchMyCheckins.mockResolvedValue(fx.checkins);
  m.submitCheckin.mockResolvedValue();
  m.fetchClients.mockResolvedValue(fx.clients);
  m.fetchRecentResponses.mockResolvedValue(fx.responses);
  m.fetchExercises.mockResolvedValue(fx.exercises);
});

async function login(user: api.SessionUser) {
  m.loadSessionUser.mockResolvedValue(user);
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('tu@email.com'), user.email);
  await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secreta123');
  await fireEvent.press(screen.getByText('Entrar'));
}
const tab = (name: string) => fireEvent.press(screen.getAllByText(name).at(-1)!);

test('login incorrecto no entra', async () => {
  m.signIn.mockRejectedValue(new Error('Email o contraseña incorrectos'));
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('tu@email.com'), 'x@test.com');
  await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'mal');
  await fireEvent.press(screen.getByText('Entrar'));
  expect(await screen.findByText('Entrar')).toBeTruthy();
  expect(m.loadSessionUser).not.toHaveBeenCalled();
});

test('cliente sin ficha de cliente no puede entrar', async () => {
  await login({ ...fx.cliente, clientId: null });
  await waitFor(() => expect(m.signOut).toHaveBeenCalled());
  expect(screen.getByText('Entrar')).toBeTruthy();
});

test('cliente: inicio y registrar una serie guarda en la base de datos', async () => {
  await login(fx.cliente);
  expect(await screen.findByText('Bloque Fuerza')).toBeTruthy();
  expect(screen.getByText('¡Hoy toca check-in!')).toBeTruthy();

  await tab('Entreno');
  await fireEvent.press(await screen.findByText('Iniciar'));
  expect(await screen.findByText('Última vez: 60 kg × 8')).toBeTruthy();
  await fireEvent.press(screen.getAllByText('Registrar')[0]);
  await fireEvent.changeText(screen.getByDisplayValue('60'), '62,5');
  await fireEvent.changeText(screen.getByPlaceholderText('8-10'), '9');
  await fireEvent.press(screen.getByText('Guardar'));
  await waitFor(() => expect(m.logSet).toHaveBeenCalledWith({ clientId: 'c1', trainingExerciseId: 'te1', weight: 62.5, reps: 9, rir: null, note: '' }));
  expect(await screen.findByText('62.5 kg · 9 reps')).toBeTruthy();
});

test('cliente: nutrición, progreso y check-in', async () => {
  await login(fx.cliente);
  await screen.findByText('Bloque Fuerza');

  await tab('Nutrición');
  expect(await screen.findByText('Plan Definición')).toBeTruthy();
  await fireEvent.press(screen.getByText(/Opción 2/));
  await waitFor(() => expect(m.chooseOption).toHaveBeenCalledWith('o2', 'm1'));

  await tab('Progreso');
  expect(await screen.findByText('↓ 2.5 kg')).toBeTruthy();
  await fireEvent.changeText(screen.getByPlaceholderText('kg'), '87');
  await fireEvent.press(screen.getByText('Guardar'));
  await waitFor(() => expect(m.logWeight).toHaveBeenCalledWith('c1', 87));

  await tab('Perfil');
  await fireEvent.press(await screen.findByText('Check-in semanal'));
  await fireEvent.changeText(screen.getByLabelText('¿Cómo has dormido?'), 'Muy bien');
  await fireEvent.press(screen.getByText('Enviar'));
  await waitFor(() => expect(m.submitCheckin).toHaveBeenCalledWith('c1', 't1', { '¿Cómo has dormido?': 'Muy bien' }));
});

test('coach: clientes, detalle, check-ins y ejercicios', async () => {
  await login(fx.coach);
  expect(await screen.findByText('Carlos Martínez')).toBeTruthy();
  await fireEvent.press(screen.getByText('Álvaro Gómez'));
  await waitFor(() => expect(m.fetchRecentResponses).toHaveBeenCalledWith('c2'));
  expect(await screen.findByText('Objetivo: 90 → 82 kg')).toBeTruthy();

  await tab('Check-ins');
  expect(await screen.findByText(/Bien/)).toBeTruthy();

  await tab('Ejercicios');
  await fireEvent.changeText(await screen.findByPlaceholderText('Buscar ejercicio...'), 'jalon');
  expect(await screen.findByText('Jalón al pecho')).toBeTruthy();
  expect(screen.queryByText('Press banca')).toBeNull();
});

test('restaura la sesión guardada al abrir la app', async () => {
  m.getSessionUserId.mockResolvedValue('u1');
  m.loadSessionUser.mockResolvedValue(fx.cliente);
  await render(<App />);
  expect(await screen.findByText(/Hola, Carlos/)).toBeTruthy();
});
