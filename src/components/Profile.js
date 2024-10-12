// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    // ユーザー情報がローカルストレージやコンテキストから取得される場合の例
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    
    if (email && name) {
      setUserInfo({ email, name });
    } else {
      // 取得できなかった場合には、ログインページに戻る処理などを実行
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="profile-container">
      <h2>プロフィール</h2>
      <div className="profile-info">
        <p><strong>氏名:</strong> {userInfo.name}</p>
        <p><strong>メールアドレス:</strong> {userInfo.email}</p>
      </div>
      <button onClick={() => navigate('/input')} className="back-button">入力フォームに戻る</button>
    </div>
  );
};

export default Profile;
