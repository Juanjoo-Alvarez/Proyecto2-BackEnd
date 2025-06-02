import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">🎯</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">EduRecom</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Descubre tu próxima
              <span className="text-blue-600"> aventura</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              EduRecom te ayuda a encontrar actividades extracurriculares perfectas para ti. 
              Basado en tus preferencias, te recomendamos experiencias que realmente disfrutarás.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-all transform hover:scale-105 font-bold text-lg shadow-lg">
                  ¡Empezar ahora! 🚀
                </button>
              </Link>
              <Link to="/login">
                <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-lg transition-all transform hover:scale-105 font-bold text-lg">
                  Ya tengo cuenta
                </button>
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo funciona?</h3>
                  <p className="text-gray-600">Tres simples pasos</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold">Configura tus preferencias</h4>
                      <p className="text-gray-600 text-sm">Dinos qué actividades te gustan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold">Recibe recomendaciones</h4>
                      <p className="text-gray-600 text-sm">IA inteligente encuentra actividades para ti</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold">¡Disfruta la experiencia!</h4>
                      <p className="text-gray-600 text-sm">Participa en actividades increíbles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir EduRecom?</h2>
            <p className="text-gray-600 text-lg">Las mejores características para tu experiencia</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">IA Inteligente</h3>
              <p className="text-gray-600">Algoritmos avanzados que aprenden de tus gustos</p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recomendaciones Rápidas</h3>
              <p className="text-gray-600">Encuentra actividades perfectas en segundos</p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Personalizado</h3>
              <p className="text-gray-600">Cada recomendación es única para ti</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg text-white">🎯</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">EduRecom</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 EduRecom. Encuentra tu actividad perfecta.
          </p>
        </div>
      </footer>
    </div>
  );
}