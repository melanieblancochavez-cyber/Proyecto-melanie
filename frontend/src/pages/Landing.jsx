import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="lp-wrap">
      {/* Navbar (como antes) */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <span className="lp-dot" />
            Nuva
          </div>
          <nav className="lp-menu">
            <a href="#inicio" className="lp-link">Inicio</a>
            <a href="#foda" className="lp-link">FODA</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <h1>
              Organiza tus clases con una interfaz{' '}
              <span className="lp-accent">clara y moderna</span>
            </h1>
            <p className="lp-hero-sub">
              Crea grupos, agenda eventos por hora, comparte recursos y da
              seguimiento al progreso. Todo en un solo lugar, pensado para
              docentes y centros educativos.
            </p>
            <div className="lp-cta">
              <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-ghost">Registrarse</Link>
            </div>
          </div>

          {/* Mock de computadora con calendario */}
          <div className="lp-hero-art">
            <div className="pc">
              <div className="pc-bar">
                <span className="pc-dot red" />
                <span className="pc-dot yellow" />
                <span className="pc-dot green" />
              </div>
              <div className="pc-body">
                <div className="cal-head">
                  <div className="chip" />
                  <div className="chip" />
                  <div className="chip long" />
                </div>
                <div className="cal-grid">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="cell">
                      {i % 9 === 4 && <div className="pill blue" />}
                      {i % 11 === 2 && <div className="pill green" />}
                      {i % 13 === 5 && <div className="pill purple" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="pc-base" />
            </div>
          </div>
        </div>
      </section>

      {/* Misión / Visión (igual) */}
      <section className="lp-block">
        <div className="lp-grid-2">
          <div className="card">
            <h3>Misión</h3>
            <p>
              Ayudar a los docentes y comunidades educativas con una plataforma
              sencilla y potente para planificar, coordinar y evaluar sus clases.
              Nuva reduce la carga administrativa, centraliza la comunicación
              y facilita el acceso a recursos y calendarios en tiempo real,
              para que el tiempo vuelva a lo más importante: enseñar y aprender.
            </p>
          </div>
          <div className="card">
            <h3>Visión</h3>
            <p>
              Ser referencia en Hispanoamérica donde cada aula —presencial o virtual— se organiza con fluidez,
              los datos guían mejores decisiones y la tecnología se siente
              humana. Aspiramos a una escuela más conectada, transparente
              y creativa, donde la coordinación entre familias, docentes
              y estudiantes sea natural y sin fricciones.
            </p>
          </div>
        </div>
      </section>

      {/* FODA con círculo adelante y posiciones pedidas */}
      <section id="foda" className="lp-block">
        <h2 className="lp-title">Análisis FODA</h2>

        <section className="swot">
          {/* Fortalezas (arriba-izquierda) */}
          <div className="swot-card tl">
            <h3>Fortalezas</h3>
            <ul>
              <li>Calendario por mes/semana/día/agenda muy intuitivo.</li>
              <li>Gestión de tareas y recursos en un clic.</li>
              <li>Interfaz limpia, accesible y responsiva.</li>
            </ul>
          </div>

          {/* Oportunidades (arriba-derecha, texto a la derecha) */}
          <div className="swot-card tr right-align">
            <h3>Oportunidades</h3>
            <ul>
              <li>Nubes educativas.</li>
              <li>Analítica de rendimiento de clases.</li>
              <li>App móvil para familias y estudiantes.</li>
            </ul>
          </div>

          {/* Debilidades (abajo-izquierda) */}
          <div className="swot-card bl">
            <h3>Debilidades</h3>
            <ul>
              <li>Dependencia de conexión a internet.</li>
              <li>Curva de adopción en los primeros días.</li>
              <li>Recursos limitados en la versión inicial.</li>
            </ul>
          </div>

          {/* Amenazas (abajo-derecha, texto a la derecha) */}
          <div className="swot-card br right-align">
            <h3>Amenazas</h3>
            <ul>
              <li>Competidores con ecosistemas consolidados.</li>
              <li>Presupuestos escolares restringidos.</li>
              <li>Cambios en políticas de plataformas externas.</li>
            </ul>
          </div>

          {/* Círculo central AL FRENTE */}
          <div className="swot-center front">
            <span>F</span>
            <span>O</span>
            <span>A</span>
            <span>D</span>
          </div>
        </section>
      </section>

      <footer className="lp-foot">
        © {new Date().getFullYear()} Nuva -MelBlanco
      </footer>
    </div>
  );
}
