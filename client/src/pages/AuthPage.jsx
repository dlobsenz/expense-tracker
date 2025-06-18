import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

const AuthPage = () => {
  const [currentForm, setCurrentForm] = useState('login'); // 'login', 'register', 'forgot'

  const switchToLogin = () => setCurrentForm('login');
  const switchToRegister = () => setCurrentForm('register');
  const switchToForgotPassword = () => setCurrentForm('forgot');

  switch (currentForm) {
    case 'register':
      return <RegisterForm onSwitchToLogin={switchToLogin} />;
    case 'forgot':
      return <ForgotPasswordForm onSwitchToLogin={switchToLogin} />;
    default:
      return (
        <LoginForm 
          onSwitchToRegister={switchToRegister}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      );
  }
};

export default AuthPage;
