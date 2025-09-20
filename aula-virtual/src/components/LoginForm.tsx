import React from 'react';

const LoginForm: React.FC = () => {
  return (
    <form>
      <h2>Iniciar Sesión</h2>
      <div>
        <label htmlFor="email">Correo:</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>
  );
};

export default LoginForm;
