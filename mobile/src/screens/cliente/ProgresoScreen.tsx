import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { CLIENTES } from '../../data/mockData';

const H = 120;
const PAD_X = 16; // margen para que etiquetas y puntos de los extremos no se corten
const PAD_TOP = 18;

function GraficaPeso({ pesos }: { pesos: number[] }) {
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: PAD_X - 8 }}>
        {pesos.map((_, i) => (
          <Text key={i} style={{ fontSize: 9, color: Colors.textLight, width: 16, textAlign: 'center' }}>S{i + 1}</Text>
        ))}
      </View>
    </View>
  );
}

export default function ProgresoScreen() {
  const { user } = useAuth();
  const cli = CLIENTES.find(c => c.id === user?.id);

  if (!cli) return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Progreso</Text></View>
      <Text style={{padding:Spacing.md,color:Colors.textSecondary}}>Aún no hay datos de progreso para tu cuenta.</Text>
    </SafeAreaView>
  );

  const diff = +(cli.peso - cli.pesoIni).toFixed(1);
  const diffTxt = diff === 0 ? '0 kg' : `${diff < 0 ? '↓' : '↑'} ${Math.abs(diff)} kg`;
  const diffLbl = diff < 0 ? 'Total perdido' : diff > 0 ? 'Total ganado' : 'Sin cambios';
  // Verde si el cambio va en la dirección del objetivo
  const objGanar = /ganar/i.test(cli.obj);
  const diffColor = diff === 0 ? Colors.text : (diff > 0) === objGanar ? Colors.success : Colors.warning;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Progreso</Text></View>
      <ScrollView style={s.scroll}>
        <View style={s.card}>
          <Text style={s.cardTit}>Evolución del peso</Text>
          <View style={s.pesoRow}>
            <View style={s.pesoItem}><Text style={s.pesoVal}>{cli.peso} kg</Text><Text style={s.pesoLbl}>Actual</Text></View>
            <View style={s.pesoItem}><Text style={[s.pesoVal,{color:diffColor}]}>{diffTxt}</Text><Text style={s.pesoLbl}>{diffLbl}</Text></View>
            <View style={s.pesoItem}><Text style={s.pesoVal}>{cli.pesoIni} kg</Text><Text style={s.pesoLbl}>Inicial</Text></View>
          </View>
          <GraficaPeso pesos={cli.pesos}/>
        </View>
        <View style={s.statsRow}>
          {[{v:`${cli.adh}%`,l:'Adherencia',c:Colors.success},{v:`${cli.kcal.a}`,l:'Kcal media',c:Colors.primary},{v:cli.obj,l:'Objetivo',c:Colors.warning}].map(st=>(
            <View key={st.l} style={s.statCard}>
              <Text style={[s.statVal,{color:st.c}]}>{st.v}</Text>
              <Text style={s.statLbl}>{st.l}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{padding:Spacing.md,paddingBottom:0},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  card:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.md,...Shadow.sm},
  cardTit:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text,marginBottom:Spacing.md},
  pesoRow:{flexDirection:'row',justifyContent:'space-around',marginBottom:Spacing.sm},
  pesoItem:{alignItems:'center'},
  pesoVal:{fontSize:FontSize.lg,fontWeight:'700',color:Colors.text},
  pesoLbl:{fontSize:FontSize.xs,color:Colors.textSecondary,marginTop:2},
  statsRow:{flexDirection:'row',gap:Spacing.sm},
  statCard:{flex:1,backgroundColor:Colors.card,borderRadius:Radius.md,padding:Spacing.md,alignItems:'center',...Shadow.sm},
  statVal:{fontSize:FontSize.md,fontWeight:'700',marginBottom:4,textAlign:'center'},
  statLbl:{fontSize:FontSize.xs,color:Colors.textSecondary,textAlign:'center'},
});
