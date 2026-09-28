import type { Metadata } from 'next';
import { LEGAL } from '@/config/legal';

export const metadata: Metadata = { title: 'Política de privacidad — Chris Fitness' };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 font-display text-lg tracking-wide text-white">{children}</h2>;
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-ink px-4 py-10">
      <article className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
        <h1 className="font-display text-3xl tracking-wide text-white">Política de privacidad</h1>
        <p className="mt-2 text-xs">Última actualización: {LEGAL.lastUpdated}</p>

        <H>1. Responsable</H>
        <p className="mt-2">
          {LEGAL.ownerName} ({LEGAL.businessName}), NIF {LEGAL.taxId}, {LEGAL.address}. Contacto:{' '}
          <span className="text-white">{LEGAL.email}</span>.
        </p>

        <H>2. Qué datos tratamos</H>
        <ul className="mt-2 list-disc pl-5">
          <li>Identificación y contacto: nombre y email.</li>
          <li>Entrenamiento: rutinas asignadas, series, pesos, repeticiones y notas.</li>
          <li>Nutrición: plan asignado y opciones elegidas.</li>
          <li>
            <span className="text-white">Datos de salud</span>: peso corporal, objetivos, respuestas a los check-ins y
            fotografías de progreso físico.
          </li>
        </ul>

        <H>3. Para qué y con qué base legal</H>
        <p className="mt-2">
          Para prestarte el servicio de entrenamiento y asesoramiento que has contratado (ejecución del contrato). Los
          datos de salud y las fotografías solo se tratan con tu <span className="text-white">consentimiento
          explícito</span>, que das al activar tu cuenta y puedes retirar en cualquier momento. No usamos tus datos para
          publicidad ni los vendemos.
        </p>

        <H>4. Quién puede verlos</H>
        <p className="mt-2">
          Solo tu entrenador. Las fotografías se guardan en un almacenamiento privado y se muestran mediante enlaces
          temporales. Usamos proveedores que actúan como encargados del tratamiento: Supabase (base de datos,
          autenticación y almacenamiento) y Vercel (alojamiento de la web). Algunos pueden tratar datos fuera del Espacio
          Económico Europeo con las garantías previstas en el RGPD (cláusulas contractuales tipo).
        </p>

        <H>5. Cuánto tiempo</H>
        <p className="mt-2">
          Mientras seas cliente. Cuando termines el servicio o solicites la baja, eliminaremos tu cuenta, fotografías y
          registros, salvo lo que la ley obligue a conservar (por ejemplo, facturación).
        </p>

        <H>6. Tus derechos</H>
        <p className="mt-2">
          Puedes pedir acceso, rectificación, supresión (incluida la eliminación de tu cuenta), oposición, limitación y
          portabilidad, y retirar tu consentimiento, escribiendo a <span className="text-white">{LEGAL.email}</span>. Si
          no quedas satisfecho, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).
        </p>
      </article>
    </main>
  );
}
