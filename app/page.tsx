import Link from 'next/link'
import { Mail, BarChart3, Clock, Users, CheckCircle, ArrowRight, Zap, Shield, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#67b960] flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">MailingBP</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-[#67b960] transition-colors">Funcionalidades</a>
            <a href="#tracking" className="hover:text-[#67b960] transition-colors">Tracking</a>
            <a href="#pricing" className="hover:text-[#67b960] transition-colors">Precio</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative grid-bg overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-28 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#67b960]/10 text-[#67b960] rounded-full px-4 py-2 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Plataforma de email marketing empresarial
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Enviá mails que{' '}
            <span className="text-[#67b960]">generan resultados</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-body">
            Subí tus templates, importá tus bases de destinatarios, programá el envío y trackeá cada apertura en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base py-3 px-8 justify-center">
              Empezar ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base py-3 px-8 justify-center">
              Ya tengo cuenta
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 pt-10 border-t border-gray-100">
            <div>
              <div className="font-display text-3xl font-bold text-gray-900">99%</div>
              <div className="text-sm text-gray-500 mt-1">Entregabilidad</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-500 mt-1">Templates</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-gray-900">RT</div>
              <div className="text-sm text-gray-500 mt-1">Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitás</h2>
          <p className="text-gray-500 text-lg">Una plataforma completa para gestionar tus comunicaciones por email</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Mail,
              color: 'bg-green-50 text-[#67b960]',
              title: 'Templates HTML',
              desc: 'Subí tus propios templates en HTML con variables dinámicas como {{nombre}}, {{empresa}} y más.',
            },
            {
              icon: Users,
              color: 'bg-blue-50 text-[#4ea1ee]',
              title: 'Bases de destinatarios',
              desc: 'Importá bases en CSV o Excel con todas las columnas necesarias para personalizar cada envío.',
            },
            {
              icon: Clock,
              color: 'bg-purple-50 text-purple-500',
              title: 'Scheduller de envíos',
              desc: 'Programá tus campañas para que se envíen el día y hora exacta que necesitás.',
            },
            {
              icon: BarChart3,
              color: 'bg-orange-50 text-orange-500',
              title: 'Dashboard de métricas',
              desc: 'Visualizá en tiempo real tasa de apertura, entregas exitosas y fallos por campaña.',
            },
            {
              icon: Shield,
              color: 'bg-red-50 text-red-500',
              title: 'Tracking por destinatario',
              desc: 'Sabé exactamente quién abrió tu mail, cuándo y desde qué dispositivo.',
            },
            {
              icon: Globe,
              color: 'bg-teal-50 text-teal-500',
              title: 'Roles y permisos',
              desc: 'Control total con roles de usuario y administrador para tu equipo.',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracking section */}
      <section id="tracking" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-6">
                Tracking completo de cada envío
              </h2>
              <div className="space-y-4">
                {[
                  'Confirmación de entrega en bandeja',
                  'Pixel de apertura 1x1 invisible',
                  'Timestamp exacto de apertura',
                  'Historial por destinatario',
                  'Exportación de reportes en Excel',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-[#67b960] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary mt-8 inline-flex">
                Comenzar tracking <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-4">Estado de campaña</div>
              <div className="space-y-3">
                {[
                  { label: 'Enviados', count: '1,240', color: 'bg-blue-500', pct: '100%' },
                  { label: 'Entregados', count: '1,198', color: 'bg-green-500', pct: '97%' },
                  { label: 'Abiertos', count: '489', color: 'bg-[#67b960]', pct: '39%' },
                  { label: 'Fallidos', count: '42', color: 'bg-red-400', pct: '3%' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-medium text-gray-900">{s.count} <span className="text-gray-400">({s.pct})</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-[#67b960] to-[#4ea1ee] rounded-3xl p-16 text-white">
          <h2 className="font-display text-4xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-white/80 text-lg mb-8">Creá tu cuenta y enviá tu primera campaña en minutos.</p>
          <Link href="/register" className="bg-white text-[#67b960] font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition inline-flex items-center gap-2">
            Crear cuenta gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#67b960] flex items-center justify-center">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-gray-700">MailingBP</span>
          </div>
          <div>© {new Date().getFullYear()} MailingBP. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  )
}
