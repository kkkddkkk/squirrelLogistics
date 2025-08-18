import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import {
  calculateDistance,
  createDeliveryRequest,
  fetchVehicleTypes,
  fetchSavedAddresses,
  saveSavedAddressesBulk,
  deleteSavedAddress,
} from "../../api/estimate/estimateApi";
import { useSelector, useDispatch } from "react-redux";
import { setDistance, setMinWeight, setMaxWeight } from "../../slice/estimate/estimateSlice";
import "./EstimateForm.css";

const cargoOptions = [
  "가전제품",
  "가구",
  "위험물 (취급주의 +5000)",
  "귀중품 (취급주의 +5000)",
  "냉장식품",
  "기타",
];

// 🔁 한글 라벨 <-> 서버 enum 매핑
const LABEL_TO_TYPE = { "출발지": "START", "도착지": "END", "경유지": "WAYPOINT" };
const TYPE_TO_LABEL = { START: "출발지", END: "도착지", WAYPOINT: "경유지" };

const EstimateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ 훅은 한 줄에 하나씩, 조건/연산자 체인 안에서 호출 금지 (ESLint 경고 방지)
  const estimateState = useSelector((state) => state.estimate);
  const auth = useSelector((s) => s.auth || s.user || {});
  const companyStateCompanyId = useSelector((s) => s.company?.companyId);
  const companyStateUserInfoCompanyId = useSelector((s) => s.company?.userInfo?.companyId);

  const { distance } = estimateState;

  // 토큰/유저(스토리지) - 훅 아님
  const tokenFromStore = auth?.token || auth?.accessToken || null;
  const tokenFromStorage = (() => {
    try { return localStorage.getItem("accessToken") || localStorage.getItem("token"); }
    catch (_) { return null; }
  })();
  const isLoggedIn = Boolean(tokenFromStore || tokenFromStorage);

  const userFromStorage = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch (_) { return null; }
  })();

  const mergedUser = auth?.user || userFromStorage || {};
  const userId = mergedUser?.userId ?? mergedUser?.id ?? null;

  // 훅 값 병합(훅 호출 없음)
  const companyId =
    companyStateCompanyId ??
    companyStateUserInfoCompanyId ??
    auth?.user?.companyId ??
    mergedUser?.companyId ??
    null;

  // 로컬 상태
  const [price, setPrice] = useState(0);
  const [distanceOnlyPrice, setDistanceOnlyPrice] = useState(0);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [waypoints, setWaypoints] = useState([""]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [cargoTypes, setCargoTypes] = useState([]);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleTypeId, setVehicleTypeId] = useState("");

  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState(13);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 차량 목록 로딩
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchVehicleTypes();
        const normalized = (list || []).map((v) => ({
          id: v.id ?? v.vehicleTypeId ?? v.vehicle_type_id ?? null,
          name: v.name,
          maxWeight: v.maxWeight ?? v.max_weight ?? null,
        }));
        setVehicleTypes(normalized);
      } catch (e) {
        console.error("차량 목록 로드 실패:", e);
      }
    })();
  }, []);

  // 저장된 기본 주소 로딩
  useEffect(() => {
    (async () => {
      if (!companyId) return;
      try {
        const list = await fetchSavedAddresses(companyId);
        setSavedAddresses(list);
      } catch (e) {
        console.error("기본 주소 로드 실패:", e);
      }
    })();
  }, [companyId]);

  // 거리/무게/화물종류 변경 시 금액 재계산
  useEffect(() => {
    const km = distance && !isNaN(distance) ? distance : 0;
    const baseByDistance = 100000 + Math.ceil(km) * 3000;
    setDistanceOnlyPrice(baseByDistance);

    let total = baseByDistance + weight * 30000;
    if (cargoTypes.includes("위험물 (취급주의 +5000)")) total += 5000;
    if (cargoTypes.includes("귀중품 (취급주의 +5000)")) total += 5000;

    setPrice(Math.floor(total));
  }, [distance, weight, cargoTypes]);

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

    dispatch(setDistance(result)); // km
    dispatch(setMinWeight(weight));
    dispatch(setMaxWeight(weight));
  };

  const resetAddresses = () => {
    setDeparture("");
    setArrival("");
    setWaypoints([""]);
    dispatch(setDistance(0));
  };

  // 기본 주소 일괄 저장
  const saveDefaultAddress = async () => {
    if (!companyId) {
      alert("로그인/회사 식별 정보가 없어 기본 주소를 저장할 수 없습니다.");
      return;
    }
    const items = [];
    if (departure) items.push({ type: LABEL_TO_TYPE["출발지"], value: departure });
    if (arrival) items.push({ type: LABEL_TO_TYPE["도착지"], value: arrival });
    waypoints.filter(Boolean).forEach((w) => {
      items.push({ type: LABEL_TO_TYPE["경유지"], value: w });
    });
    if (items.length === 0) {
      alert("저장할 주소가 없습니다.");
      return;
    }

    try {
      const saved = await saveSavedAddressesBulk(companyId, items);
      setSavedAddresses(saved);
      alert("기본 주소가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("기본 주소 저장에 실패했습니다.");
    }
  };

  // 기본 주소 단건 삭제
  const removeDefaultAddress = async (addr) => {
    try {
      await deleteSavedAddress(addr.id);
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  // 저장된 기본 주소 적용
  const applySavedAddress = (addr) => {
    const label = TYPE_TO_LABEL[addr.type] || "기타";
    if (label === "출발지") setDeparture(addr.value);
    else if (label === "도착지") setArrival(addr.value);
    else if (label === "경유지") {
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

  // 요청하기
  const handleRequest = async () => {
    if (!departure || !arrival || !title || !startDate || !endDate || !distance || !price || !vehicleTypeId) {
      alert("필수 항목(차량/날짜/주소/금액 등)을 모두 입력하고 계산을 완료해주세요.");
      return;
    }
    const ok = window.confirm("이 내용으로 요청하시겠습니까?");
    if (!ok) return;

    const waypointDtos = waypoints
      .filter(Boolean)
      .map((addr, idx) => ({ address: addr, dropOrder: idx + 1 }));

    const payload = {
      startAddress: departure,
      endAddress: arrival,
      memoToDriver: title,
      totalCargoCount: waypointDtos.length + 1,
      totalCargoWeight: Math.round(Number(weight) * 1000), // 톤→kg
      estimatedFee: Math.round(Number(price)),
      distance: Math.round(Number(distance)),              // km 정수(서버와 단위 합의)
      createAt: null,
      wantToStart: toLocalDateTime(startDate),
      wantToEnd: toLocalDateTime(endDate),
      // expectedPolyline/expectedRoute는 백엔드에서 채움
      status: "REGISTERED",
      vehicleTypeId: Number(vehicleTypeId),
      waypoints: waypointDtos,
      companyId: companyId ?? null,       // 로그인 시 식별
      requesterUserId: userId ?? null,    // 로그인 시 식별
    };

    try {
      const requestId = await createDeliveryRequest(payload);
      alert(`요청이 저장되었습니다. (ID: ${requestId})`);
      // navigate(`/requests/${requestId}`);
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

      <div className="form-row"><div>출발지: {departure || "(미입력)"}</div></div>
      <div className="form-row"><div>도착지: {arrival || "(미입력)"}</div></div>

      {waypoints.map((w, i) => (
        <div className="form-row" key={i}>
          <span>경유지 {i + 1}:</span>
          <button className="address-button small waypoint-search" onClick={() => openWaypointPopup(i)}>
            검색
          </button>
          <span>{w || "(미입력)"}</span>
        </div>
      ))}

      <div className="button-row">
        <button className="action-button small" onClick={resetAddresses}>거리 다시 계산</button>
        <button className="action-button small" onClick={handleCalculateDistance}>거리 및 금액 계산</button>
        <button className="action-button small" onClick={saveDefaultAddress}>기본주소로 설정</button>
      </div>

      {savedAddresses.length > 0 && (
        <div className="info-section">
          <p>📌 저장된 기본 주소:</p>
          {savedAddresses.map((addr) => (
            <div
              key={addr.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>
                {TYPE_TO_LABEL[addr.type] || addr.type}: {addr.value}
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

      {/* 차량 + 화물 종류 */}
      <div className="form-row">
        <select
          value={vehicleTypeId}
          onChange={(e) => setVehicleTypeId(Number(e.target.value) || "")}
        >
          <option value="">차량 종류 선택</option>
          {vehicleTypes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}{v.maxWeight ? ` (최대 ${v.maxWeight}톤)` : ""}
            </option>
          ))}
        </select>

        <select onChange={(e) => handleCargoSelect(e.target.value)}>
          <option value="">화물 종류</option>
          {cargoOptions.map((opt) => (
            <option key={opt}>{opt}</option>
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
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="product title (필수)" />
      </div>

      <div className="weight-slider">
        <label>📦 무게 선택 (1톤 ~ 26톤)</label>
        <input type="range" min="1" max="26" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        <div className="weight-labels">
          <span>1톤</span><span>{weight}톤</span><span>26톤</span>
        </div>
      </div>

      <div className="info-section">
        <p>총 예상 금액: {price.toLocaleString()}원</p>
      </div>

      <p className="delivery-label">배송 희망 날짜 :</p>
      <div className="datepicker-row">
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="출발 날짜" showTimeSelect dateFormat="yyyy-MM-dd HH:mm" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="도착 날짜" showTimeSelect dateFormat="yyyy-MM-dd HH:mm" />
      </div>

      <div className="form-row">
        <button className="driver-button" onClick={() => navigate("/driverSearch")}>기사님 검색</button>
        <button className="submit-button" onClick={handleRequest}>요청하기</button>
      </div>

      <p className="inquiry" onClick={() => navigate("/contact")}>문의하기</p>
    </div>
  );
};

export default EstimateForm;
