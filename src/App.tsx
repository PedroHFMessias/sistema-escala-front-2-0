// src/App.tsx
import { AppRouter } from './router/AppRouter';
import './styles/globals.css';
import { AuthProvider } from './context/AuthContext'; // Importar AuthProvider

function App() {
  return (
    <div className="App">
      <AuthProvider> {/* Envolver o AppRouter com AuthProvider */}
        <AppRouter />
      </AuthProvider>
    </div>
  );
}

export default App;