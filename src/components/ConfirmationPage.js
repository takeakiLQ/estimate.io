// src/components/ConfirmationPage.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  const handleBack = () => {
    navigate('/input');
  };

  const handleEstimate = async () => {
    try {
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");

      const logData = [
        new Date().toLocaleString(),
        userName,
        userEmail,
        state.formData.region,
        state.formData.longTerm,
        state.formData.deliveryType,
        state.formData.hasHeavyItems,
        state.formData.baseDistance,
        state.formData.vehicleType,
        state.formData.collectionService,
        state.formData.uniform,
        Object.entries(state.formData.workDays).map(
          ([day, isActive]) => `${workDaysLabels[day]}:${isActive ? '稼働あり' : '稼働なし'}`
        ).join(', ')
      ];

      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values/見積作成ログ!A1:append`,
        {
          values: [logData],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            valueInputOption: 'USER_ENTERED',
          },
        }
      );

      alert("見積が作成され、ログが記録されました！");
    } catch (error) {
      console.error("見積作成ログの記録に失敗しました:", error.response ? error.response.data : error.message);
      alert("見積作成ログの記録に失敗しました。再度お試しください。");
    }
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
          <span className="confirmation-value">{state.formData.baseDistance}㎞</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">車種区分</span>
          <span className="confirmation-value">{state.formData.vehicleType}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">集金業務の有無</span>
          <span className={state.formData.collectionService === "あり" ? "confirmation-value-active" : "confirmation-value"}>
            {state.formData.collectionService}
          </span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">服装指定の有無</span>
          <span className={state.formData.uniform === "あり" ? "confirmation-value-active" : "confirmation-value"}>
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
        <button onClick={handleEstimate} className="estimate-button">見積作成</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
