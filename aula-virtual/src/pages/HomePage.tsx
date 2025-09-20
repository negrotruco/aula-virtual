import React from 'react';
import LoginForm from '../components/LoginForm';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Aula Virtual Universitaria</h1>
      <p className="text-lg mb-8">Bienvenido. Por favor, inicia sesión para continuar.</p>
      <LoginForm />
    </div>
  );
};

export default HomePage;
