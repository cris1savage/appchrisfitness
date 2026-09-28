import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

const H = 120;
const PAD_X = 16; // margen para que etiquetas y puntos de los extremos no se corten
const PAD_TOP = 18;

export default function GraficaPeso({ pesos, labels }: { pesos: number[]; labels?: string[] }) {
  // Ancho real del contenedor (antes se usaba Dimensions al cargar el módulo: fallaba al rotar / en tablet)
  const [w, setW] = useState(0);
  if (pesos.length === 0) return <Text style={{ color: Colors.textSecondary }}>Sin registros de peso todavía</Text>;

  const max = Math.max(...pesos);
  const min = Math.min(...pesos);
  const rng = max - min || 1;
  const innerW = Math.max(w - PAD_X * 2, 0);
  const step = pesos.length > 1 ? innerW / (pesos.length - 1) : 0;
  const pts = pesos.map((p, i) => ({
    x: PAD_X + (pesos.length > 1 ? i * step : innerW / 2),
    y: PAD_TOP + (H - PAD_TOP) - ((p - min) / rng) * (H - PAD_TOP),
    v: p,
  }));

  return (
    <View style={{ height: H + 30, marginTop: Spacing.sm }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <View style={{ height: H + 8 }}>
          {[0, 0.5, 1].map(f => (
            <View key={f} style={{ position: 'absolute', top: PAD_TOP + f * (H - PAD_TOP), left: 0, right: 0, height: 1, backgroundColor: Colors.border }} />
          ))}
          {/* Segmentos: se centran en el punto medio y se rotan desde su centro (origen por defecto) */}
          {pts.slice(1).map((p, i) => {
            const a = pts[i];
            const dx = p.x - a.x, dy = p.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            return (
              <View key={`l${i}`} style={{
                position: 'absolute',
                left: (a.x + p.x) / 2 - len / 2,
                top: (a.y + p.y) / 2 - 1,
                width: len,
                height: 2,
                backgroundColor: Colors.primary,
                transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
              }} />
            );
          })}
          {pts.map((p, i) => (
            <React.Fragment key={`p${i}`}>
              <View style={{ position: 'absolute', left: p.x - 4, top: p.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary }} />
              <Text style={{ position: 'absolute', left: p.x - 20, top: p.y - 18, width: 40, fontSize: 9, color: Colors.textSecondary, textAlign: 'center' }}>{p.v}kg</Text>
            </React.Fragment>
          ))}
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: PAD_X - 14 }}>
        {pesos.map((_, i) => (
          <Text key={i} style={{ fontSize: 9, color: Colors.textLight, width: 28, textAlign: 'center' }}>{labels?.[i] ?? `${i + 1}`}</Text>
        ))}
      </View>
    </View>
  );
}
