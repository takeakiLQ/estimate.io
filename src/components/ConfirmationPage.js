// src/components/ConfirmationPage.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const { state } = useLocation(); // FormComponentから渡されたデータ
  const navigate = useNavigate();

  // stateがない場合にフォームに戻る
  if (!state || !state.formData) {
    return (
      <div className="error-container">
        <p>エラー: 入力内容が見つかりません。</p>
        <button onClick={() => navigate('/')}>フォームに戻る</button>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/input'); // フォームに戻る
  };

  const handleEstimate = () => {
    console.log("見積実行データ:", state.formData);
    alert("見積が作成されました！");
  };

  // 稼働曜日の日本語ラベル
  const workDaysLabels = {
    monday: '月',
    tuesday: '火',
    wednesday: '水',
    thursday: '木',
    friday: '金',
    saturday: '土',
    sunday: '日',
    holiday: '祝',
  };

  return (
    <div className="confirmation-container">
      <h2 className="confirmation-title">入力内容の確認</h2>
      
      <div className="confirmation-table">
        <div className="confirmation-row">
          <span className="confirmation-label">稼働地（都道府県）</span>
          <span className="confirmation-value">{state.formData.region}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">長期/短期区分</span>
          <span className="confirmation-value">{state.formData.longTerm}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">配送区分</span>
          <span className="confirmation-value">{state.formData.deliveryType}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">10kg以上荷物の有無</span>
          <span className={state.formData.hasHeavyItems === "あり" ? "confirmation-value-active" : "confirmation-value"}>
            {state.formData.hasHeavyItems}
          </span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">基準距離</span>
          <span className="confirmation-value">{state.formData.baseDistance}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">車種区分</span>
          <span className="confirmation-value">{state.formData.vehicleType}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">集金業務の有無</span>
          <span className={state.formData.collectionService === 'あり' ? "confirmation-value-active" : "confirmation-value"}>
            {state.formData.collectionService}
          </span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">服装指定の有無</span>
          <span className={state.formData.uniform === 'あり' ? "confirmation-value-active" : "confirmation-value"}>
            {state.formData.uniform}
          </span>
        </div>
      </div>

      <h3 className="confirmation-title">稼働曜日</h3>
      <ul className="workdays-list">
        {Object.keys(state.formData.workDays).map(day => (
          <li key={day} className="confirmation-row">
            <span className="workdays-label">{workDaysLabels[day]}</span>
            <span className={state.formData.workDays[day] ? "workdays-status-active" : "workdays-status"}>
              {state.formData.workDays[day] ? '稼働あり' : '稼働なし'}
            </span>
          </li>
        ))}
      </ul>

      <div className="button-group">
        <button onClick={handleBack} className="back-button">戻る</button>
        <button onClick={handleEstimate}>見積作成</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
