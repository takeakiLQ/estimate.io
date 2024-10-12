// src/components/ConfirmationPage.js

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const uniqueSheetName = `算定ロジック_${new Date().toISOString()}`;

      const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;
      const sourceSheetId = parseInt(process.env.REACT_APP_SOURCE_SHEET_ID, 10);

      // シートをコピー
      const copyResponse = await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/sheets/${sourceSheetId}:copyTo`,
        { destinationSpreadsheetId: spreadsheetId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newSheetId = copyResponse.data.sheetId;

      // ユニーク名をコピー先のシートに設定
      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: newSheetId,
                  title: uniqueSheetName,
                },
                fields: "title",
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // 作成日、作成者、メールアドレス、regionなどのデータの準備
      const logData = [
        [
          new Date().toLocaleString(),
          userName,
          userEmail,
          state.formData.region,
          state.formData.startTime,
          state.formData.endTime,
          state.formData.longTerm,
          state.formData.deliveryType,
          state.formData.hasHeavyItems,
          state.formData.baseDistance,
          state.formData.vehicleType,
          state.formData.collectionService,
          state.formData.uniform,
          Object.entries(state.formData.workDays).map(
            ([day, isActive]) => `${workDaysLabels[day]}:${isActive ? '稼働あり' : '稼働なし'}`
          ).join(', '),
          state.formData.notes || 'なし' // メモ欄
        ],
      ];

      // コピーしたシートにデータを書き込む
      await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${uniqueSheetName}!B3:P3`,
        {
          range: `${uniqueSheetName}!B3:P3`,
          majorDimension: "ROWS",
          values: logData,
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

      // 計算結果のフラグを確認
      const flagResponse = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${uniqueSheetName}!I7`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const calculationFlag = flagResponse.data.values[0][0];
      const status = calculationFlag === "成功" ? "成功" : "失敗";

      // 成功または失敗の結果を見積作成ログに追記
      const finalLogData = [
        ...logData[0],
        status,
      ];

      // 見積作成ログに書き込む
      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/見積作成ログ!A1:append`,
        {
          values: [finalLogData],
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

      if (status === "成功") {
        const resultResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              "ranges": [`${uniqueSheetName}!K7:L24`, `${uniqueSheetName}!N7:O15`, `${uniqueSheetName}!N17:O17`,`${uniqueSheetName}!N27:O38`],
            },
            paramsSerializer: params => {
              return params.ranges.map(range => `ranges=${encodeURIComponent(range)}`).join('&');
            },
          }
        );

        const calculationResult = {
          range1: resultResponse.data.valueRanges[0].values,
          range2: resultResponse.data.valueRanges[1].values,
          range3: resultResponse.data.valueRanges[2].values,
          range4: resultResponse.data.valueRanges[3].values,

        };
        navigate('/result-page', { state: { calculationResult } });
      } else {
        alert("計算が失敗しました。ログを確認してください。");
      }

      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          requests: [
            {
              deleteSheet: {
                sheetId: newSheetId,
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {
      console.error("エラー:", error);
      alert("見積作成中にエラーが発生しました。再試行してください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="confirmation-container">
      <h2 className="confirmation-title">入力内容の確認</h2>

      <div className="confirmation-table">
        <div className="confirmation-row">
          <span className="confirmation-label">稼働地（都道府県）</span>
          <span className="confirmation-value">{state.formData.region}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">開始時間</span>
          <span className="confirmation-value">{state.formData.startTime}</span>
        </div>
        <div className="confirmation-row">
          <span className="confirmation-label">終了時間</span>
          <span className="confirmation-value">{state.formData.endTime}</span>
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
          <span className="confirmation-value">{state.formData.baseDistance} ㎞</span>
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
          <span className={state.formData.uniform && state.formData.uniform !== "なし" ? "confirmation-value confirmation-value-uniform" : "confirmation-value"}>
            {state.formData.uniform}
          </span>
        </div>
      </div>

      <h3 className="confirmation-title">稼働曜日</h3>
      <ul className="workdays-list">
        {Object.keys(state.formData.workDays).map(day => (
          <li key={day} className={`confirmation-row ${day === 'saturday' ? 'bg-light-blue' : day === 'sunday' ? 'bg-light-red' : day === 'holiday' ? 'bg-light-pink' : 'bg-light-gray'}`}>
            <span className="workdays-label">{workDaysLabels[day]}</span>
            <span className={state.formData.workDays[day] ? "workdays-status-active" : "workdays-status"}>
              {state.formData.workDays[day] ? '稼働あり' : '稼働なし'}
            </span>
          </li>
        ))}
      </ul>

      <div className="confirmation-row-notes">
        <span className="confirmation-label-notes">メモ欄</span>
        <span className="confirmation-value-notes">{state.formData.notes}</span>
      </div>

      <div className="button-group">
        <button onClick={handleBack} className="back-button">戻る</button>
        <button onClick={handleEstimate} className="estimate-button">見積作成</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
