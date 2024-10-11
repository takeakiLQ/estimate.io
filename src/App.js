// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import FormComponent from './components/FormComponent';
import ConfirmationPage from './components/ConfirmationPage';
import Profile from './components/Profile';


const App = () => {
  const [formData, setFormData] = useState(null); // フォームデータの状態を管理

  // フォーム送信時に呼び出される関数
  const handleFormSubmit = (data) => {
    setFormData(data); // FormComponentから送信されたデータを保存
  };

  return (
    // Google OAuthプロバイダー。クライアントIDは.envファイルから読み込みます。
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router basename="/estimate.io">
        <Routes>
          {/* ログインページ */}
          <Route path="/" element={<Login />} />
          {/* 入力フォームページ */}
          <Route path="/input" element={<FormComponent onSubmit={handleFormSubmit} />} />
          {/* 確認ページ */}
          <Route path="/confirmation" element={<ConfirmationPage formData={formData} />} />
          {/* プロフィールページ */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
