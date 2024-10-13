// src/components/FormComponent.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FormComponent.css';

const FormComponent = ({ onSubmit }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [menuOpen, setMenuOpen] = useState(false);

  const initialFormData = JSON.parse(localStorage.getItem("formData")) || {
    region: "",
    startTime: "09:00",
    endTime: "18:00",
    longTerm: "",
    deliveryType: "",
    hasHeavyItems: "",
    baseDistance: "",
    vehicleType: "",
    collectionService: "",
    uniform: "",
    workDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      holiday: false,
    },
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [prefectures, setPrefectures] = useState([]);
  const [longTermOptions, setLongTermOptions] = useState([]);
  const [deliveryTypeOptions, setDeliveryTypeOptions] = useState([]);
  const [hasHeavyItemsOptions, setHasHeavyItemsOptions] = useState([]);
  const [baseDistanceOptions, setBaseDistanceOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [collectionServiceOptions, setCollectionServiceOptions] = useState([]);
  const [uniformOptions, setUniformOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // Field references for focusing on errors
  const regionRef = useRef();
  const longTermRef = useRef();
  const deliveryTypeRef = useRef();
  const hasHeavyItemsRef = useRef();
  const baseDistanceRef = useRef();
  const vehicleTypeRef = useRef();
  const collectionServiceRef = useRef();
  const uniformRef = useRef();

  // メニューの表示・非表示を切り替える関数
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // メニュークリック時の処理
  const handleMenuClick = (option) => {
    setMenuOpen(false);
    if (option === "profile") {
      navigate('/profile');
    } else if (option === "logout") {
      localStorage.removeItem("token");
      navigate('/');
    }
  };

  

  // 稼働曜日ラベルの定義
  const workDaysLabels = [
    { key: 'monday', label: '月' },
    { key: 'tuesday', label: '火' },
    { key: 'wednesday', label: '水' },
    { key: 'thursday', label: '木' },
    { key: 'friday', label: '金' },
    { key: 'saturday', label: '土' },
    { key: 'sunday', label: '日' },
    { key: 'holiday', label: '祝' },
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const spreadsheetId = process.env.REACT_APP_SPREADSHEET_ID;
        const ranges = [
          '各種マスタ!F2:F100',
          '各種マスタ!J2:J100',
          '各種マスタ!M2:M100',
          '各種マスタ!P2:P100',
          '各種マスタ!S2:S100',
          '各種マスタ!V2:V100',
          '各種マスタ!Y2:Y100',
          '各種マスタ!AB2:AB100',
        ];

        const requests = ranges.map(range =>
          axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );

        const responses = await Promise.all(requests);

        setPrefectures(responses[0].data.values.flat());
        setLongTermOptions(responses[1].data.values.flat());
        setDeliveryTypeOptions(responses[2].data.values.flat());
        setHasHeavyItemsOptions(responses[3].data.values.flat());
        setBaseDistanceOptions(responses[4].data.values.flat());
        setVehicleTypeOptions(responses[5].data.values.flat());
        setCollectionServiceOptions(responses[6].data.values.flat());
        setUniformOptions(responses[7].data.values.flat());

      } catch (error) {
        console.error("Error fetching options:", error);
        alert("オプションデータの取得に失敗しました。ログインを確認してください。");
      }
    };

    if (token) {
      fetchOptions();
    } else {
      console.log("アクセストークンが見つかりません");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    localStorage.setItem("formData", JSON.stringify({ ...formData, [name]: value }));
  };

  const handleToggleChange = (day) => {
    const updatedWorkDays = { ...formData.workDays, [day]: !formData.workDays[day] };
    setFormData({ ...formData, workDays: updatedWorkDays });
    localStorage.setItem("formData", JSON.stringify({ ...formData, workDays: updatedWorkDays }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.region) newErrors.region = "稼働地（都道府県）は必須です";
    if (!formData.longTerm) newErrors.longTerm = "長期/短期区分は必須です";
    if (!formData.deliveryType) newErrors.deliveryType = "配送区分は必須です";
    if (!formData.hasHeavyItems) newErrors.hasHeavyItems = "10kg以上荷物の有無は必須です";
    if (!formData.baseDistance) newErrors.baseDistance = "基準距離は必須です";
    if (!formData.vehicleType) newErrors.vehicleType = "車種区分は必須です";
    if (!formData.collectionService) newErrors.collectionService = "集金業務の有無は必須です";
    if (!formData.uniform) newErrors.uniform = "服装指定の有無は必須です";

    const workDaysSelected = Object.values(formData.workDays).some(day => day);
    if (!workDaysSelected) newErrors.workDays = "稼働曜日を少なくとも1つ選択してください";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      switch (firstErrorField) {
        case "region":
          regionRef.current.focus();
          break;
        case "longTerm":
          longTermRef.current.focus();
          break;
        case "deliveryType":
          deliveryTypeRef.current.focus();
          break;
        case "hasHeavyItems":
          hasHeavyItemsRef.current.focus();
          break;
        case "baseDistance":
          baseDistanceRef.current.focus();
          break;
        case "vehicleType":
          vehicleTypeRef.current.focus();
          break;
        case "collectionService":
          collectionServiceRef.current.focus();
          break;
        case "uniform":
          uniformRef.current.focus();
          break;
        default:
          break;
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      navigate('/confirmation', { state: { formData, fromConfirmation: true } });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <header className="menu">
        <div className="menu-icon" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <button onClick={() => handleMenuClick("profile")}>プロフィール</button>
            <button className="logout-button" onClick={() => handleMenuClick("logout")}>ログアウト</button>
          </div>
        )}
      </header>

      <h2>定価見積もりフォーム</h2>

      <div className="form-group">
        <label>稼働地（都道府県）</label>
        <select name="region" value={formData.region} onChange={handleChange} ref={regionRef}>
          <option value="">選択してください</option>
          {prefectures.map((prefecture, index) => (
            <option key={index} value={prefecture}>{prefecture}</option>
          ))}
        </select>
        {errors.region && <p className="error">{errors.region}</p>}
      </div>

      <div className="form-group">
        <label>稼働開始時間</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>稼働終了時間</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>長期/短期区分</label>
        <select name="longTerm" value={formData.longTerm} onChange={handleChange} ref={longTermRef}>
          <option value="">選択してください</option>
          {longTermOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.longTerm && <p className="error">{errors.longTerm}</p>}
      </div>

      <div className="form-group">
        <label>配送区分</label>
        <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} ref={deliveryTypeRef}>
          <option value="">選択してください</option>
          {deliveryTypeOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.deliveryType && <p className="error">{errors.deliveryType}</p>}
      </div>

      <div className="form-group">
        <label>10kg以上荷物の有無</label>
        <select name="hasHeavyItems" value={formData.hasHeavyItems} onChange={handleChange} ref={hasHeavyItemsRef}>
          <option value="">選択してください</option>
          {hasHeavyItemsOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.hasHeavyItems && <p className="error">{errors.hasHeavyItems}</p>}
      </div>

      <div className="form-group">
        <label>基準距離（㎞）</label>
        <select name="baseDistance" value={formData.baseDistance} onChange={handleChange} ref={baseDistanceRef}>
          <option value="">選択してください</option>
          {baseDistanceOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.baseDistance && <p className="error">{errors.baseDistance}</p>}
      </div>

      <div className="form-group">
        <label>車種区分</label>
        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} ref={vehicleTypeRef}>
          <option value="">選択してください</option>
          {vehicleTypeOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.vehicleType && <p className="error">{errors.vehicleType}</p>}
      </div>

      <div className="form-group">
        <label>集金業務の有無</label>
        <select name="collectionService" value={formData.collectionService} onChange={handleChange} ref={collectionServiceRef}>
          <option value="">選択してください</option>
          {collectionServiceOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.collectionService && <p className="error">{errors.collectionService}</p>}
      </div>

      <div className="form-group">
        <label>服装指定の有無</label>
        <select name="uniform" value={formData.uniform} onChange={handleChange} ref={uniformRef}>
          <option value="">選択してください</option>
          {uniformOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errors.uniform && <p className="error">{errors.uniform}</p>}
      </div>

      <fieldset>
        <legend>稼働曜日</legend>
        {workDaysLabels.map(({ key, label }) => (
          <div key={key} className={`toggle-container ${key === 'saturday' ? 'bg-light-blue' : key === 'sunday' ? 'bg-light-red' : key === 'holiday' ? 'bg-light-pink' : ''}`}>
            <label className="day-label">{label}</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.workDays[key]}
                onChange={() => handleToggleChange(key)}
              />
              <span className="slider round"></span>
            </label>
            <span className="status-text">
              {formData.workDays[key] ? '稼働あり' : '稼働なし'}
            </span>
          </div>
        ))}
        {errors.workDays && <p className="error">{errors.workDays}</p>}
      </fieldset>

      <div className="form-group no-space">
        <label htmlFor="notes">メモ欄</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="必要な場合にメモを入力してください..."
        ></textarea>
      </div>

      <button type="submit">決定</button>
    </form>
  );
};

export default FormComponent;
