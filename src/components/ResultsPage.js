// src/components/ResultsPage.js

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultsPage.css';
import axios from 'axios';  // axiosをインポート

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const calculationResult = location.state?.calculationResult;
  const [showDetails, setShowDetails] = useState(false);

  const [loading, setLoading] = useState(false);

// ローカルストレージからトークンとユーザー情報を取得
const userToken = localStorage.getItem("token");
const userEmail = localStorage.getItem("userEmail")



  if (!calculationResult) {
    return <p>データがありません。計算を実行してください。</p>;
  }


  

  const sendEmail = async () => {
    if (!userToken || !userEmail) {
      alert("ログイン情報が不足しています。再度ログインしてください。");
      return;
    }
  
    try {
      setLoading(true);
  
      // 件名をBase64でエンコード
      const subject = `見積結果のお知らせ`;
      const encodedSubject = btoa(unescape(encodeURIComponent(subject)));
  
      // メール内容の構成
      const message = [
        `To: ${userEmail}`,
        `Subject: =?utf-8?B?${encodedSubject}?=`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "",
        "以下の通り、見積結果をご案内します。",
        "",
        "---基本情報---------------------------",
        "",
        `稼働地: ${calculationResult.range4[0][1]}`,
        `稼働開始時間: ${calculationResult.range4[1][1]}`,
        `稼働終了時間: ${calculationResult.range4[2][1]}`,
        `長期/短期区分: ${calculationResult.range4[3][1]}`,
        `配送区分: ${calculationResult.range4[4][1]}`,
        `10kg以上荷物の有無: ${calculationResult.range4[5][1]}`,
        `基準距離: ${calculationResult.range4[6][1]} km`,
        `車種区分: ${calculationResult.range4[7][1]}`,
        `集金業務の有無: ${calculationResult.range4[8][1]}`,
        `服装指定の有無: ${calculationResult.range4[9][1]}`,
        `稼働曜日: ${calculationResult.range4[10][1]}`,
        `メモ欄: ${calculationResult.range4[11][1] || "なし"}`,  // メモ欄が空の場合「なし」と表示
        "",
        "--------------------------------------",
        "",
        "▼▼算定結果▼▼",
        "",
        "---見積価格---------------------------",
        "",
        `契約単価: ${calculationResult.range2[0][1]} 円`,
        `適用拘束時間: ${calculationResult.range2[1][1]} 時間`,
        `適用基準距離: ${calculationResult.range2[2][1]} km`,
        "",
        "（内訳）",
        `基本料金: ${calculationResult.range1[12] ? calculationResult.range1[12][1] : 'データなし'} 円`,
        ...calculationResult.range2.slice(3, 7).map((item) => `${item[0]}: ${item[1]} 円`),
        "",
        "（その他超過）",
        ...calculationResult.range2.slice(7, 9).map((item) => `${item[0]}: ${item[1]}`),
        "",
        "--------------------------------------",



      ].join("\n");
  
      // メッセージのエンコード
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  
      // Gmail APIを使ってメールを送信
      const response = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          raw: encodedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        alert("見積結果がメールで送信されました！");
      } else {
        console.error("メール送信エラー: Gmail APIが予期せぬステータスを返しました。", response);
        alert("メール送信中にエラーが発生しました。");
      }
    } catch (error) {
      console.error("メール送信エラー:", error);
      alert("メール送信中にエラーが発生しました。詳細はコンソールをご確認ください。");
    } finally {
      setLoading(false);
    }
  };
  



  return (
    <div className="results-container">
      <h2>算定結果</h2>

      {/* お見積りセクション */}
      <div className="range2-estimate">
        <span className="range2-estimate-label">見積料金</span>
        {calculationResult.range2.slice(0, 3).map((item, index) => (
          <div key={index} className="range2-item bold-item">
            <span className="range2-label">{item[0]}</span>
            <span className="range2-value">
              {item[1]}
              {index === 0 && " 円"}
              {index === 1 && " 時間"}
              {index === 2 && " ㎞"}
            </span>
          </div>
        ))}
      </div>

      {/* 内訳セクション */}
      <div className="range2-subtotal">

      <span className="range2-subtotal-label">内訳</span>
      {/* 基本料金の表示 */}
        {calculationResult.range1[14] && (
          <div className="range2-item sub-item">
          <span className="range2-label">基本料金</span>
          <span className="range2-value">{calculationResult.range1[14][1]} 円</span>
          </div>
          )}

        {calculationResult.range2.slice(3, 7).map((item, index) => (
          
          <div key={index + 3} className="range2-item sub-item">

            <span className="range2-label">{item[0]}</span>
            <span className="range2-value">{item[1]} 円</span>
          </div>
        ))}
      </div>

      {/* その他超過セクション */}
      <div className="range2-overage">
        <span className="range2-overage-label">その他超過</span>
        {calculationResult.range2.slice(7, 9).map((item, index) => (
          <div key={index + 7} className="range2-item">
            <span className="range2-label">{item[0]}</span>
            <span className="range2-value">{item[1]}</span>
          </div>
        ))}
      </div>

      {/* メモ欄 */}
      {calculationResult.range3[0] && (
        <div className="range3-item">
          <span className="range3-label">メモ欄</span>
          <span className="range3-value">{calculationResult.range3[0][1]}</span>
        </div>
      )}

      {/* 戻るボタン */}
      <button className="back-button" onClick={() => navigate(-1)}>戻る</button>

      {/* アコーディオンヘッダー */}
      <h3 className="section-header" onClick={() => setShowDetails(!showDetails)}>
        <span className={showDetails ? "arrow open" : "arrow closed"}>
          {showDetails ? '▲' : '▼'}
        </span>
      </h3>

      {/* アコーディオン内の算定結果（内訳：詳細） */}
      <div className={`accordion-content ${showDetails ? 'open' : 'closed'}`}>
        <h3 className="section-H3">（内訳：詳細）</h3>
        <div className="range1-section">
          {/* 契約単価、適用拘束時間、適用基準距離のグループ */}
          <div className="range1-group-main">
            {calculationResult.range1[0] && (
              <div className="range1-item-main">
                <span className="range1-label">総合計（⑥+⑦）</span>
                <span className="range1-value">{calculationResult.range1[0][1] + " 円"}</span>
              </div>
            )}
            {calculationResult.range1[1] && (
              <div className="range1-item-indent">
                <span className="range1-label">適用拘束時間</span>
                <span className="range1-value">{calculationResult.range1[1][1]} 時間</span>
              </div>
            )}
            {calculationResult.range1[2] && (
              <div className="range1-item-indent">
                <span className="range1-label">適用基準距離</span>
                <span className="range1-value">{calculationResult.range1[2][1]} ㎞</span>
              </div>
            )}
          </div>

          {/* 手配割増のサブグループ */}
          <div className="range1-group-surcharge">
            {calculationResult.range1[3] && (
              <div className="range1-item">
                <span className="range1-label">①拘束時間料金</span>
                <span className="range1-value">{calculationResult.range1[3][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[11] && (
              <div className="range1-item">
                <span className="range1-label">②走行距離料金</span>
                <span className="range1-value">{calculationResult.range1[11][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[12] && (
              <div className="range1-item">
                <span className="range1-label">③小計（①+②）</span>
                <span className="range1-value">{calculationResult.range1[12][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[4] && (
              <div className="range1-item">
                <span className="range1-label">④手配割増</span>
                <span className="range1-value">{calculationResult.range1[4][1]} 円</span>
              </div>
            )}
            {calculationResult.range1.slice(5, 11).map(
              (item, index) =>
                item && (
                  <div key={index + 5} className="range1-item-indent">
                    <span className="range1-label">④{item[0]}</span>
                    <span className="range1-value">{item[1]} 円</span>
                  </div>
                )
            )}
            {calculationResult.range1[13] && (
              <div className="range1-item">
                <span className="range1-label">⑤車両指定割増</span>
                <span className="range1-value">{calculationResult.range1[13][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[14] && (
              <div className="range1-item-additional">
                <span className="range1-label">⑥合計（③+④+⑤）</span>
                <span className="range1-value">{calculationResult.range1[14][1]} 円</span>
              </div>
            )}
          </div>

          {/* オプション料金グループ */}
          <div className="range1-group-additional">
            {calculationResult.range1[17] && (
              <div className="range1-item-additional">
                <span className="range1-label">⑦オプション料金</span>
                <span className="range1-value">{calculationResult.range1[17][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[15] && (
              <div className="range1-item-indent">
                <span className="range1-label">⑦集金業務加算</span>
                <span className="range1-value">{calculationResult.range1[15][1]} 円</span>
              </div>
            )}
            {calculationResult.range1[16] && (
              <div className="range1-item-indent">
                <span className="range1-label">⑦服装指定加算</span>
                <span className="range1-value">{calculationResult.range1[16][1]} 円</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={sendEmail} className="send-email-button" disabled={loading}>
        {loading ? "送信中..." : "メールで送信"}
      </button>

    </div>
  );
};

export default ResultsPage;
