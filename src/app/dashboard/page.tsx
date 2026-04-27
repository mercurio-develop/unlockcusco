import { Building2, Settings, MessageSquare, PieChart } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-xl">Valle Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r border-slate-200 bg-white p-4 hidden md:block">
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
              <PieChart className="w-5 h-5" />
              Resumen
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <MessageSquare className="w-5 h-5" />
              Leads y Mensajes
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Building2 className="w-5 h-5" />
              Mi Perfil
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings className="w-5 h-5" />
              Configuración
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">¡Bienvenido a tu Panel!</h1>
            <p className="text-slate-600 mb-8 text-lg">Tu perfil ahora es visible y estás listo para recibir turistas de todo el mundo.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">Vistas del Perfil</h3>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">124</p>
                <div className="text-green-600 text-xs font-medium mt-2 bg-green-50 w-max px-2 py-1 rounded-md">+12% esta semana</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">Nuevos Leads (WhatsApp)</h3>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2">1</p>
                <div className="text-slate-500 text-xs font-medium mt-2 bg-slate-50 w-max px-2 py-1 rounded-md">Tu primer lead está aquí</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 font-medium text-sm">Estado de Suscripción</h3>
                <p className="text-xl font-extrabold text-slate-900 mt-2">Prueba Gratis</p>
                <div className="text-yellow-600 text-xs font-medium mt-2 bg-yellow-50 w-max px-2 py-1 rounded-md">14 días restantes</div>
              </div>
            </div>

            <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <h2 className="text-2xl font-bold mb-2">Desbloquea tu Primer Contacto</h2>
              <p className="text-indigo-100 mb-6 max-w-xl">
                La turista internacional "Sarah J." intentó reservar hace unos minutos. Ahora que tu perfil está activado, puedes ver sus datos y contactarla directamente para cerrar la venta.
              </p>
              <button className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-50 transition-colors">
                Ver Datos de Contacto
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}