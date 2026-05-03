import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimacaoPrincipal } from './components/AnimacaoPrincipal';
import { AdminGifts } from './pages/AdminGifts';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/convite" replace />} />
        <Route path="/convite" element={<AnimacaoPrincipal />} />
        {/* Rota "escondida" para gerenciar presentes */}
        <Route path="/admin-presentes" element={<AdminGifts />} />
      </Routes>
    </Router>
  );
}

export default App;
