// src/components/estimate/EstimateForm.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { calculateDistance, createDeliveryRequest } from "../../api/estimate/estimateApi";
import { useSelector, useDispatch } from "react-redux";
import {
  setDistance,
  setMinWeight,
  setMaxWeight,
} from "../../slice/estimate/estimateSlice";

import "./EstimateForm.css";

const cargoOptions = [
  "가전제품",
  "가구",
  "위험물 (취급주의 +5000)",
  "귀중품 (취급주의 +5000)",
  "냉장식품",
  "기타",
];
const vehicleOptions = ["일반 카고", "윙바디", "냉장/냉동", "탑차", "리프트"];

const EstimateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { distance } = useSelector((state) => state.estimate);
  const companyIdFromStore = useSelector((state) =>
    state.company?.companyId ?? state.company?.userInfo?.companyId ?? null
  );

  const [price, setPrice] = useState(0);
  const [distanceOnlyPrice, setDistanceOnlyPrice] = useState(0);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [waypoints, setWaypoints] = useState([""]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [cargoTypes, setCargoTypes] = useState([]);
  const [vehicle, setVehicle] = useState("");
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [weight, setWeight] = useState(13);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 기본 주소 로드
  useEffect(() => {
    const loaded = localStorage.getItem("defaultAddresses");
    if (loaded) setSavedAddresses(JSON.parse(loaded));
  }, []);

  // 거리/무게/화물종류 변경 시 금액 재계산
  useEffect(() => {
    recalculatePrice();
  }, [distance, weight, cargoTypes]);

  // ✅ 요금정책: 기본 10,000 + (ceil(거리km)*2,000) + 무게*5,000 + 취급주의 각각 +5,000
  const recalculatePrice = () => {
    const km = distance && !isNaN(distance) ? distance : 0;
    const baseByDistance = 10000 + Math.ceil(km) * 2000; // 기본 + 거리요금
    setDistanceOnlyPrice(baseByDistance);

    let total = baseByDistance + weight * 5000;
    if (cargoTypes.includes("위험물 (취급주의 +5000)")) total += 5000;
    if (cargoTypes.includes("귀중품 (취급주의 +5000)")) total += 5000;

    setPrice(Math.floor(total));
  };

  const openAddressPopup = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setter(data.address);
      },
    }).open();
  };

  const openWaypointPopup = (index) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const updated = [...waypoints];
        updated[index] = data.address;
        setWaypoints(updated);
      },
    }).open();
  };

  const handleCalculateDistance = async () => {
    if (!departure || !arrival) {
      alert("출발지와 도착지를 입력해주세요.");
      return;
    }
    const addresses = [departure, ...waypoints.filter(Boolean), arrival];
    const result = await calculateDistance(addresses);

    if (!result || isNaN(result)) {
      dispatch(setDistance(0));
      return;
    }

    dispatch(setDistance(result));
    dispatch(setMinWeight(weight));
    dispatch(setMaxWeight(weight));
  };

  const resetAddresses = () => {
    setDeparture("");
    setArrival("");
    setWaypoints([""]);
    dispatch(setDistance(0));
  };

  const saveDefaultAddress = () => {
    const updated = [...savedAddresses];
    if (departure) updated.push({ type: "출발지", value: departure });
    if (arrival) updated.push({ type: "도착지", value: arrival });
    waypoints.filter(Boolean).forEach((w) => {
      updated.push({ type: "경유지", value: w });
    });
    const unique = Array.from(
      new Map(updated.map((obj) => [obj.type + obj.value, obj])).values()
    ).slice(0, 10);
    setSavedAddresses(unique);
    localStorage.setItem("defaultAddresses", JSON.stringify(unique));
  };

  const removeDefaultAddress = (addr) => {
    const updated = savedAddresses.filter((a) => a !== addr);
    setSavedAddresses(updated);
    localStorage.setItem("defaultAddresses", JSON.stringify(updated));
  };

  const applySavedAddress = (addr) => {
    if (addr.type === "출발지") setDeparture(addr.value);
    else if (addr.type === "도착지") setArrival(addr.value);
    else if (addr.type === "경유지") {
      setWaypoints((prev) => {
        const updated = [...prev];
        const emptyIndex = updated.findIndex((v) => !v);
        if (emptyIndex !== -1) updated[emptyIndex] = addr.value;
        else if (updated.length < 3) updated.push(addr.value);
        return updated;
      });
    }
  };

  const handleCargoSelect = (value) => {
    if (value && !cargoTypes.includes(value)) {
      setCargoTypes([...cargoTypes, value]);
    }
  };

  const handleCargoRemove = (value) => {
    setCargoTypes(cargoTypes.filter((v) => v !== value));
  };

  // === Helpers ===
  // LocalDateTime 문자열(yyyy-MM-dd'T'HH:mm:ss) 생성
  const toLocalDateTime = (d) => {
    if (!d) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const yy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  };

  // 차량 라벨 → vehicleTypeId 매핑 (임시)
  const mapVehicleToId = (label) => {
    const table = {
      "일반 카고": 1,
      "윙바디": 2,
      "냉장/냉동": 3,
      "탑차": 4,
      "리프트": 5,
    };
    return table[label] ?? null;
  };

  // ✅ 요청완료 → 백엔드 저장
  const handleRequest = async () => {
    if (
      !departure ||
      !arrival ||
      !cargoTypes.length ||
      !vehicle ||
      !title ||
      !startDate ||
      !distance ||
      !price
    ) {
      alert("필수 항목을 모두 입력하고 거리 및 금액 계산을 완료해주세요.");
      return;
    }
    const ok = window.confirm("이 내용으로 저장하시겠습니까?");
    if (!ok) return;

    const payload = {
      startAddress: departure,
      endAddress: arrival,
      memoToDriver: title,                         // product title을 메모로 저장
      totalCargoCount: waypoints.filter(Boolean).length + 1, // 필요 시 0으로 조정
      totalCargoWeight: Math.round(Number(weight) * 1000),   // 톤 → kg 예시
      estimatedFee: Math.round(Number(price)),               // Long
      distance: Math.round(Number(distance)),                // Long
      createAt: null,                                        // 서버에서 생성하거나 DTO로 전달
      wantToStart: toLocalDateTime(startDate),
      wantToEnd: toLocalDateTime(endDate),
      expectedPolyline: null,
      expectedRoute: JSON.stringify({
        waypoints: waypoints.filter(Boolean),
        cargoTypes,
        distance,
        price,
        volume,
      }),
      status: "REQUESTED",
      paymentId: null,
      companyId: companyIdFromStore,
      vehicleTypeId: mapVehicleToId(vehicle),
    };

    try {
      const saved = await createDeliveryRequest(payload);
      alert("요청이 저장되었습니다.");
      // 저장 후 원하는 곳으로 이동
      // navigate(`/requests/${saved.requestId}`);
      // navigate("/board");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="estimate-container">
      <h2>🚚 예상 금액 계산</h2>

      <div className="address-row">
        <button className="address-button" onClick={() => openAddressPopup(setDeparture)}>
          출발지 검색
        </button>
        <button className="address-button" onClick={() => openAddressPopup(setArrival)}>
          도착지 검색
        </button>
        <button
          className="address-button"
          onClick={() => setWaypoints([...waypoints, ""].slice(0, 3))}
        >
          경유지 추가
        </button>
      </div>

      <div className="form-row">
        <div>출발지: {departure || "(미입력)"}</div>
      </div>
      <div className="form-row">
        <div>도착지: {arrival || "(미입력)"}</div>
      </div>

      {waypoints.map((w, i) => (
        <div className="form-row" key={i}>
          <span>경유지 {i + 1}:</span>
          <button
            className="address-button small waypoint-search"
            onClick={() => openWaypointPopup(i)}
          >
            검색
          </button>
          <span>{w || "(미입력)"}</span>
        </div>
      ))}

      <div className="button-row">
        <button className="action-button small" onClick={resetAddresses}>
          거리 다시 계산
        </button>
        <button className="action-button small" onClick={handleCalculateDistance}>
          거리 및 금액 계산
        </button>
        <button className="action-button small" onClick={saveDefaultAddress}>
          기본주소로 설정
        </button>
      </div>

      {savedAddresses.length > 0 && (
        <div className="info-section">
          <p>📌 저장된 기본 주소:</p>
          {savedAddresses.map((addr, i) => (
            <div
              key={i}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>
                {addr.type}: {addr.value}
              </span>
              <div>
                <button onClick={() => applySavedAddress(addr)} style={{ marginRight: "8px" }}>
                  선택
                </button>
                <button onClick={() => removeDefaultAddress(addr)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-section">
        <p>예상 거리 : {distance ? Math.floor(distance) + " km" : "0 km"}</p>
        <p>거리 예상 금액 : {distanceOnlyPrice.toLocaleString()} 원</p>
      </div>

      <div className="form-row">
        <select onChange={(e) => handleCargoSelect(e.target.value)}>
          <option value="">화물 종류</option>
          {cargoOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
          <option value="">차량 종류</option>
          {vehicleOptions.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="form-row tag-list">
        {cargoTypes.map((type) => (
          <span key={type}>
            {type}
            <button onClick={() => handleCargoRemove(type)}>x</button>
          </span>
        ))}
      </div>

      <div className="form-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="product title (필수)"
        />
        <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="예상 부피 (선택)" />
      </div>

      <div className="weight-slider">
        <label>📦 무게 선택 (1톤 ~ 26톤)</label>
        <input
          type="range"
          min="1"
          max="26"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <div className="weight-labels">
          <span>1톤</span>
          <span>{weight}톤</span>
          <span>26톤</span>
        </div>
      </div>

      <div className="info-section">
        <p>총 예상 금액: {price.toLocaleString()}원</p>
      </div>

      <p className="delivery-label">배송 희망 날짜 :</p>
      <div className="datepicker-row">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="출발 날짜"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="도착 날짜"
        />
      </div>

      <div className="form-row">
        <button className="driver-button" onClick={() => navigate("/driverSearch")}>
          기사님 검색
        </button>
        <button className="submit-button" onClick={handleRequest}>
          요청완료
        </button>
      </div>

      <p className="inquiry" onClick={() => navigate("/contact")}>
        문의하기
      </p>
    </div>
  );
};

export default EstimateForm;
