export const CLIENTES = [
  { id:'c1', nombre:'Carlos Martínez', email:'carlos@test.com', edad:32, altura:178, peso:85.2, pesoIni:92, obj:'Perder grasa', pesos:[92,90.5,89.2,87.8,86.5,85.2], kcal:{a:1850,o:2200}, adh:87 },
  { id:'c2', nombre:'Álvaro Gómez', email:'alvaro@test.com', edad:28, altura:182, peso:74.5, pesoIni:70, obj:'Ganar músculo', pesos:[70,71,72,73,74,74.5], kcal:{a:2800,o:3000}, adh:92 },
  { id:'c3', nombre:'Javier López', email:'javier@test.com', edad:35, altura:175, peso:79.8, pesoIni:82, obj:'Recomposición', pesos:[82,81.5,81,80.5,80,79.8], kcal:{a:2100,o:2400}, adh:74 },
  { id:'c4', nombre:'Miguel Sánchez', email:'miguel@test.com', edad:42, altura:172, peso:95.3, pesoIni:102, obj:'Perder peso', pesos:[102,101,99.5,98,96.5,95.3], kcal:{a:1600,o:1900}, adh:68 },
];
export const CHECKINS = [
  { id:'ci1', clienteId:'c2', fecha:'2026-09-19', peso:74.5, energia:9, fuerza:9, sueno:8, comentario:'Me noto con mucha energía esta semana.', respondido:false },
  { id:'ci2', clienteId:'c3', fecha:'2026-09-17', peso:79.8, energia:6, fuerza:6, sueno:5, comentario:'Semana irregular, no he podido dormir bien.', respondido:false },
  { id:'ci3', clienteId:'c1', fecha:'2026-09-18', peso:85.2, energia:7, fuerza:8, sueno:7, comentario:'Semana bastante buena, me noto más fuerte.', respondido:true, respuesta:'Perfecto Carlos, seguimos así.' },
];
export const RUTINAS = [
  { id:'r1', nombre:'Push A', descripcion:'Pecho · Hombros · Tríceps', color:'#4A5C8A', ejercicios:[
    { nombre:'PRESS BANCA', series:4, reps:'8-10', descanso:'2min', rir:'2', video:'https://youtube.com/shorts/mQruhM7i2uw' },
    { nombre:'PRESS INCLINADO 30°', series:3, reps:'10-12', descanso:'90s', rir:'2', video:'https://youtube.com/shorts/HZuuMaoCv4A' },
    { nombre:'ELEVACIONES LATERALES', series:4, reps:'12-15', descanso:'60s', rir:'2', video:'https://youtube.com/shorts/R5DGM-ewOZE' },
    { nombre:'TRICEPS EN POLEA CON CUERDA', series:3, reps:'12-15', descanso:'60s', rir:'2', video:'https://youtube.com/shorts/UarWtAPHn4o' },
  ]},
  { id:'r2', nombre:'Pull A', descripcion:'Espalda · Bíceps', color:'#16A34A', ejercicios:[
    { nombre:'DOMINADAS PRONAS', series:4, reps:'6-8', descanso:'2min', rir:'2', video:'https://youtube.com/shorts/VVA9M3sC45Y' },
    { nombre:'REMO CON BARRA', series:4, reps:'8-10', descanso:'2min', rir:'2', video:'https://youtube.com/shorts/kBWAon7ItDw' },
    { nombre:'JALÓN AL PECHO', series:3, reps:'10-12', descanso:'90s', rir:'2', video:'https://youtube.com/shorts/G7298b2EBQw' },
    { nombre:'CURL CON BARRA', series:3, reps:'10-12', descanso:'60s', rir:'2', video:'https://youtube.com/shorts/ZHRML2E9bgo' },
  ]},
  { id:'r3', nombre:'Legs A', descripcion:'Cuádriceps · Glúteos · Isquios', color:'#D97706', ejercicios:[
    { nombre:'SENTADILLA CON BARRA', series:4, reps:'6-8', descanso:'3min', rir:'2', video:'' },
    { nombre:'PRENSA 45°', series:4, reps:'10-12', descanso:'2min', rir:'2', video:'https://youtube.com/shorts/WpYz3qOJPD0' },
    { nombre:'HIP THRUST CON BARRA', series:4, reps:'10-12', descanso:'2min', rir:'2', video:'https://youtube.com/shorts/0raPTUNHOq8' },
    { nombre:'CURL FEMORAL TUMBADO', series:3, reps:'12-15', descanso:'90s', rir:'2', video:'https://youtube.com/shorts/AnbFnGF88Ug' },
  ]},
];
export const PLAN_SEMANA = [
  {dia:'Lunes',rutinaId:'r1'},{dia:'Martes',rutinaId:null},{dia:'Miércoles',rutinaId:'r2'},
  {dia:'Jueves',rutinaId:null},{dia:'Viernes',rutinaId:'r3'},{dia:'Sábado',rutinaId:null},{dia:'Domingo',rutinaId:null},
];
export const USUARIOS = [
  {id:'coach1',nombre:'Chris',email:'chris@chrisfitness.com',password:'1234',rol:'coach' as const},
  {id:'c1',nombre:'Carlos Martínez',email:'carlos@test.com',password:'1234',rol:'cliente' as const},
  {id:'c2',nombre:'Álvaro Gómez',email:'alvaro@test.com',password:'1234',rol:'cliente' as const},
  {id:'c3',nombre:'Javier López',email:'javier@test.com',password:'1234',rol:'cliente' as const},
  {id:'c4',nombre:'Miguel Sánchez',email:'miguel@test.com',password:'1234',rol:'cliente' as const},
];
