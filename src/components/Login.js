// src/components/Login.js

import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
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
        if (!userData.emailAddresses || !userData.names) {
          console.error("ユーザー情報の取得に失敗しました");
          alert("ユーザー情報の取得に失敗しました。再度ログインしてください。");
          return;
        }

        const email = userData.emailAddresses[0].value;
        const name = userData.names[0].displayName;

        // ローカルストレージにユーザー情報を保存
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);

        // ログイン履歴をスプレッドシートに追加
        await axios.post(
          `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values/ログイン履歴!A1:append`,
          {
            values: [[new Date().toLocaleString(), name, email]], // 日時, ユーザー名, メールアドレス
          },
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
              'Content-Type': 'application/json',
            },
            params: {
              valueInputOption: 'USER_ENTERED',
            },
          }
        );

        // 入力フォームページに遷移
        navigate('/input'); 
      } catch (error) {
        console.error("ユーザー情報の取得またはログイン履歴の記録に失敗しました:", error.response ? error.response.data : error.message);
        alert("エラーが発生しました。再度ログインしてください。");
      }
    },
    onError: () => {
      console.log('Login failed');
      alert("ログインに失敗しました。再試行してください。");
    }
  });

  return (
    <div className="login-container">
      <h2>ログインフォーム</h2>
      <button className="google-login-button" onClick={login}>
        Googleでログイン
      </button>
    </div>
  );
};

export default Login;
