// src/components/Login.js

import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // トークンをローカルストレージに保存
        localStorage.setItem("token", response.access_token);

        // Google People APIを使ってユーザー情報を取得
        const userInfoResponse = await axios.get('https://people.googleapis.com/v1/people/me', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
          params: {
            personFields: 'names,emailAddresses',
          },
        });

        const userData = userInfoResponse.data;
        const email = userData.emailAddresses[0].value;
        const name = userData.names[0].displayName;

        // ローカルストレージにユーザー情報を保存
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);

        // 非同期処理完了後に入力フォームページに遷移
        navigate('/input'); 
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      }
    },
    onError: () => {
      console.log('Login failed');
    }
  });

  return (
    <div>
      <h2>ログインフォーム</h2>
      <button onClick={login}>Googleでログイン</button>
    </div>
  );
};

export default Login;
