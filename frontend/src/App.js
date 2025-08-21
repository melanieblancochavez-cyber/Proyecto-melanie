import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Grupos from './pages/Grupos';
import TareasClase from './pages/TareasClase';
import RecursosClase from './pages/RecursosClase';
import Planificador from './pages/Planificador';
import Landing from "./pages/Landing";




function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/grupo/:id/tareas" element={<TareasClase />} />
        <Route path="/grupo/:id/recursos" element={<RecursosClase />} />
        <Route path="/grupo/:id/planificacion" element={<Planificador />} /> 
      </Routes>
    </Router>
  );
}

export default App;
