import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createSearchParams, useNavigate } from "react-router-dom";
import {
  calculateDistance,
  createDeliveryRequest,
  fetchVehicleTypes,
  fetchCargoTypes
} from "../../api/estimate/estimateApi";
import { useSelector, useDispatch } from "react-redux";
import { setDistance } from "../../slice/estimate/estimateSlice";
import CargoDialog from "./CargoDialog";
import http from "../../api/user/api"; // 기본주소용 http 인스턴스
import "./EstimateForm.css";
import { Box, Grid, useTheme } from "@mui/material";
import { CommonSmallerTitle, CommonTitle } from "../common/CommonText";
import CommonList from "../common/CommonList";
import { ButtonContainer, OneButtonAtRight, Three100Buttons, ThreeButtons, Two100Buttons, TwoButtonsAtEnd } from "../common/CommonButton";
import { theme, applyThemeToCssVars } from "../common/CommonTheme";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import "./EstimateForm_new.css";

const STORAGE_KEY = "deliveryFlow";
const WAYPOINT_FEE_PER_ITEM = 50000;

const EstimateForm_new = () => {
  const thisTheme = useTheme();
  applyThemeToCssVars(thisTheme);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // redux
  const { distance } = useSelector((s) => s.estimate);

  // 주소/화물 상태
  const [hubAddress, setHubAddress] = useState("");
  const [finalAddress, setFinalAddress] = useState("");
  const [memoToDriver, setMemoToDriver] = useState("");
  const [finalCargo, setFinalCargo] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [totalCargoCount, setTotalCargoCount] = useState(0);
  const [totalCargoWeight, setTotalCargoWeight] = useState(0);

  // 회사/차량/가격
  const [companyId, setCompanyId] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [price, setPrice] = useState(0);
  const [distanceOnlyPrice, setDistanceOnlyPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const [hasCalculated, setHasCalculated] = useState(false);

  // 취급유형 옵션(서버)
  const [cargoTypeOptions, setCargoTypeOptions] = useState([]);

  // 다이얼로그 상태
  // number(경유지 인덱스) | "final"(최종 목적지) | null
  const [cargoDialogIdx, setCargoDialogIdx] = useState(null);

  // 저장된 기본 주소
  const [savedAddresses, setSavedAddresses] = useState([]);

  const normalizeFlow = (raw) => {
    if (!raw) return null;
    if (raw.requestDto || raw.paymentDto) return raw;
    if (raw.request || raw.payment) {
      return { requestDto: raw.request, paymentDto: raw.payment };
    }
    return null;
  };

  const prefillFromFlow = (flow) => {
    const req = flow?.requestDto;
    if (!req) return;

    // 주소들
    setHubAddress(req.startAddress || "");
    setFinalAddress(req.endAddress || "");
    setMemoToDriver(req.memoToDriver || "");

    // 날짜
    setStartDate(req.wantToStart ? new Date(req.wantToStart) : null);
    setEndDate(req.wantToEnd ? new Date(req.wantToEnd) : null);

    // 차량/거리/요금
    setDistance(Number(req.distance || 0)); // redux로 넣는다면 dispatch(setDistance(...)) 사용
    setVehicleTypeId(req.vehicleTypeId ? String(req.vehicleTypeId) : "");
    // price는 아래 재계산 로직이 있으니 그대로 두거나 표기만 참조하게 둠

    // 경유지 + 화물
    // req.waypoints: [{address, dropOrder, status, cargo?{description,handlingId}}...]
    // 첫 항목은 출발지(집하지), 마지막은 최종 목적지로 들어있다면, 중간만 경유지로
    const wps = Array.isArray(req.waypoints) ? req.waypoints : [];
    const middle = wps.slice(1, Math.max(0, wps.length - 1));

    setWaypoints(
      middle.map(w => ({
        address: w.address || "",
        cargo: w.cargo
          ? {
            description: w.cargo.description || "",
            handlingId: w.cargo.handlingId ?? null,
            // (이전 단계에서 kg로 저장하지 않았다면 기본 1000kg로 둠)
            weightKg: w.cargo.weightKg ?? 1000,
          }
          : null,
      }))
    );

    // 최종 목적지 화물
    const last = wps[wps.length - 1];
    setFinalCargo(
      last?.cargo
        ? {
          description: last.cargo.description || "",
          handlingId: last.cargo.handlingId ?? null,
          weightKg: last.cargo.weightKg ?? 1000,
        }
        : null
    );

    // 총 화물 개수/무게 (없으면 재계산되게 두어도 OK)
    setTotalCargoCount(Number(req.totalCargoCount || 0));
    setTotalCargoWeight(Number(req.totalCargoWeight || 0));
  };

  // 모든 화물(flat)
  const allCargos = useMemo(() => {
    const list = [];
    waypoints.forEach((w) => { if (w?.cargo) list.push(w.cargo); });
    if (finalCargo) list.push(finalCargo);
    return list;
  }, [waypoints, finalCargo]);

  // 취급주의/산간 플래그 (handlingId 기반, 각 1회만 적용)
  const { hasCareful, hasMountain } = useMemo(() => {
    let careful = false;
    let mountain = false;
    allCargos.forEach(c => {
      const hid = Number(c?.handlingId);
      if (!hid) return;              // null/undefined/"" → 없음
      if (hid === 1) careful = true; // 취급주의
      if (hid === 2) mountain = true; // 산간
      if (hid === 3) { careful = true; mountain = true; } // 취급주의+산간(합산)
    });
    return { hasCareful: careful, hasMountain: mountain };
  }, [allCargos]);

  // 비어있지 않은 경유지 주소
  const nonEmptyWaypoints = useMemo(
    () =>
      (waypoints || [])
        .map((w) => (typeof w === "string" ? w : w?.address || "")) // 안전 처리
        .filter((a) => a.trim() !== ""),
    [waypoints]
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const flow = normalizeFlow(parsed);
      if (!flow) return;
      prefillFromFlow(flow);
    } catch (e) {
      console.warn("[EstimateForm] session flow load failed:", e);
    }
  }, []);

  // 회사 정보(토큰 기반) 조회
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        // 토큰 유효성 핑 (선택)
        try {
          await http.get(`/api/company/test`);
        } catch (e) {
          console.warn("company/test 실패:", e);
        }

        // 실제 회사 정보 가져오기
        const resp = await http.get(`/api/company/current-user`);
        if (resp?.data?.companyId != null) {
          const cid = resp.data.companyId;
          setCompanyId(cid);
          localStorage.setItem("companyId", String(cid)); // 새로고침 대비
        } else {
          setCompanyId(null);
          localStorage.removeItem("companyId");
        }
      } catch (err) {
        console.error("회사 정보 불러오기 실패:", err);
        setCompanyId(null);
        localStorage.removeItem("companyId");
      }
    };

    fetchCompanyInfo();
  }, []);

  // 상태 변경 후 확인 로그
  useEffect(() => {
    if (companyId != null) {
      console.log("토큰 기반 companyId 업데이트:", companyId);
    }
  }, [companyId]);


  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!companyId) return;
      try {
        const res = await http.get(`/api/company/get-address/${companyId}`);
        if (res?.data?.mainLoca) {
          setSavedAddresses([{ id: 1, type: "START", value: res.data.mainLoca }]);
        } else {
          setSavedAddresses([]);
        }
      } catch {
        setSavedAddresses([]);
      }
    };
    loadSavedAddresses();
  }, [companyId]);

  // 차량 타입 로드
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchVehicleTypes();
        setVehicleTypes(list || []);
      } catch { }
    })();
  }, []);

  // 취급유형(옵션) 로드
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCargoTypes(); // [{ handlingId, handlingTags, extraFee }, ...]
        setCargoTypeOptions(list || []);
      } catch {
        setCargoTypeOptions([]);
      }
    })();
  }, []);

  // 거리/요금 계산 버튼
  const handleCalculateDistance = async () => {
    if (!hubAddress || !finalAddress) {
      alert("집하지와 최종 목적지를 입력해주세요.");
      return;
    }
    const addresses = [hubAddress, ...waypoints.map(w => w.address).filter(Boolean), finalAddress];
    const km = Number(await calculateDistance(addresses)) || 0;

    dispatch(setDistance(km));
    setHasCalculated(true);

    // 화물 합계
    const waypointWeightSum = waypoints.reduce((s, w) => s + (w.cargo?.weightKg || 0), 0);
    const totalWeight = waypointWeightSum + (finalCargo?.weightKg || 0);
    setTotalCargoWeight(totalWeight);
    setTotalCargoCount(waypoints.filter(w => !!w.cargo).length + (finalCargo ? 1 : 0));

    // 톤 요금 산정용
    const priceWeightTon = Math.max(0, Math.ceil(totalWeight / 1000)); // ✅ 최소 0톤
    setWeight(priceWeightTon);
  };

  // 총액 계산: 거리 + 무게 + 취급주의/산간(각 1회) + 경유지 수
  useEffect(() => {
    if (!hasCalculated) {
      setDistanceOnlyPrice(0);
      setPrice(0);
      return;
    }

    console.log(distance);
    const kmUnits = Math.ceil((Number(distance) || 0));

    const distanceFee = kmUnits * 3000;
    const weightFee = weight * 30000;

    let sum = 100000 + distanceFee + weightFee;
    if (hasCareful) sum += 50000;
    if (hasMountain) sum += 50000;
    const waypointFee = waypoints.filter(w => w.address?.trim()).length * 50000;
    sum += waypointFee;

    setDistanceOnlyPrice(distanceFee);  // ← 추가!
    setPrice(Math.floor(sum));
  }, [hasCalculated, distance, weight, nonEmptyWaypoints.length, hasCareful, hasMountain]);
  // 경유지 추가/삭제
  const addWaypoint = () => {
    if (waypoints.length >= 3) {
      alert("경유지는 최대 3개까지 가능합니다.");
      return;
    }
    setWaypoints((prev) => [...prev, { address: "", cargo: null }]);
  };

  const handleRemoveWaypoint = (index) =>
    setWaypoints((prev) => prev.filter((_, i) => i !== index));

  // 주소 검색(다음 우편번호)
  const openAddressPopup = (setter) => {
    new window.daum.Postcode({
      oncomplete: (data) => setter(data.address),
    }).open();
  };
  const openWaypointAddress = (idx) => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setWaypoints((prev) => {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], address: data.address };
          return copy;
        });
      },
    }).open();
  };

  // 화물 저장 (경유지 / 최종 목적지)
  const handleSaveCargo = (cargo) => {
    if (cargoDialogIdx === "final") {
      setFinalCargo(cargo);
    } else if (typeof cargoDialogIdx === "number") {
      setWaypoints((prev) => {
        const copy = [...prev];
        copy[cargoDialogIdx] = { ...copy[cargoDialogIdx], cargo };
        return copy;
      });
    }
    setCargoDialogIdx(null);
  };

  // 기본 주소 저장/삭제/적용
  const saveDefaultAddress = async () => {
    if (!companyId || !hubAddress) {
      alert("회사ID나 출발지가 없습니다.");
      return;
    }
    try {
      await http.post(`/api/company/save-address`, {
        companyId,
        address: hubAddress,
        type: "START",
      });
      alert("기본 주소 저장 성공");
      // 재로드
      const res = await http.get(`/api/company/get-address/${companyId}`);
      if (res?.data?.mainLoca) setSavedAddresses([{ id: 1, type: "START", value: res.data.mainLoca }]);
    } catch {
      alert("저장 실패");
    }
  };

  const removeDefaultAddress = async () => {
    try {
      await http.post(`/api/company/save-address`, {
        companyId,
        address: "",
        type: "CLEAR",
      });
      setSavedAddresses([]);
      alert("기본 주소 삭제됨");
    } catch {
      alert("삭제 실패");
    }
  };

  const applySavedAddress = (addr) => {
    setHubAddress(addr);
    alert(`출발지로 적용: ${addr}`);
  };

  const formatLocalDateTime = (d) => {
    if (!d) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  };

  // payload 빌드 (handlingId: null 허용)
  const buildPayload = (payment) => {
    let order = 1;
    const wp = [];
    wp.push({ address: hubAddress, dropOrder: order++, status: "PENDING" });

    waypoints.forEach((w) => {
      const base = { address: w.address, dropOrder: order++, status: "PENDING" };
      const withCargo = w.cargo
        ? { ...base, cargo: { description: w.cargo.description, handlingId: w.cargo.handlingId ?? null } }
        : base;
      wp.push(withCargo);
    });

    const finalBase = { address: finalAddress, dropOrder: order++, status: "PENDING" };
    wp.push(
      finalCargo
        ? { ...finalBase, cargo: { description: finalCargo.description, handlingId: finalCargo.handlingId ?? null } }
        : finalBase
    );

    return {
      payment,
      request: {
        startAddress: hubAddress,
        endAddress: finalAddress,
        memoToDriver,
        totalCargoCount,
        totalCargoWeight,
        estimatedFee: price,
        distance: Math.round(Number(distance) || 0),
        wantToStart: formatLocalDateTime(startDate),
        wantToEnd: formatLocalDateTime(endDate),
        companyId,
        vehicleTypeId: vehicleTypeId ? Number(vehicleTypeId) : null,
        waypoints: wp
      },
    };
  };

  // 기사님 검색
  const goDriverSearch = () => {

    // 1. 거리 및 금액 계산 확인
    if (!hasCalculated || price <= 0) {
      alert("먼저 집하지/목적지를 입력하고 거리 및 금액 계산을 해주세요.");
      return;
    }

    // 2. 차량종류 선택 확인
    if (!vehicleTypeId) {
      alert("차량종류를 선택해주세요.");
      return;
    }

    // 3. 화물 정보 확인 (최소 하나의 화물은 필요)
    const hasAnyCargo = waypoints.some(w => w.cargo) || finalCargo;
    if (!hasAnyCargo) {
      alert("최소 하나의 화물 정보를 입력해주세요.");
      return;
    }

    // 4. 배송 희망 날짜 확인
    if (!startDate || !endDate) {
      alert("배송 희망 날짜를 입력해주세요.");
      return;
    }


    const payload = buildPayload(null); // { request, payment }

    //세션스토리지에 저장
    const flow = {
      requestDto: payload.request,
      paymentDto: payload.payment,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    navigate("/driverSearch", { state: { flow } });
  };

  // 요청 확정 후 결제 페이지 이동
  const handleConfirmPayment = async () => {
    // 1. 거리 및 금액 계산 확인
    if (!hasCalculated || price <= 0) {
      alert("먼저 집하지/목적지를 입력하고 거리 및 금액 계산을 해주세요.");
      return;
    }

    // 2. 차량종류 선택 확인
    if (!vehicleTypeId) {
      alert("차량종류를 선택해주세요.");
      return;
    }

    // 3. 화물 정보 확인 (최소 하나의 화물은 필요)
    const hasAnyCargo = waypoints.some(w => w.cargo) || finalCargo;
    if (!hasAnyCargo) {
      alert("최소 하나의 화물 정보를 입력해주세요.");
      return;
    }

    // 4. 배송 희망 날짜 확인
    if (!startDate || !endDate) {
      alert("배송 희망 날짜를 입력해주세요.");
      return;
    }

    // 임시 결제 DTO(결제 페이지에서 최종 확정 예정)
    const paymentDto = {
      paid: null,
      payAmount: price,
      payMethod: null,      // 결제 페이지에서 선택
      payStatus: "PENDING",
      prepaidId: null,
      refundDate: null,
      settlement: false,
      settlementFee: 0,
    };

    const payload = buildPayload(paymentDto);
    try {
      const { requestId, paymentId } = await createDeliveryRequest(
        payload.request,
        payload.payment
      );

      // state + querystring 동시 전달
      navigate(
        {
          pathname: "/company/payment",
          search: createSearchParams({
            paymentId: String(paymentId),
            requestId: String(requestId),
          }).toString(),
        },
        {
          state: {
            flow: { ...payload, requestId, paymentId },
            requestId,
            paymentId,
            paymentAmount: paymentDto.payAmount,
          },
        }
      );
    } catch (e) {
      console.error("[createDeliveryRequest] error:", e?.response?.data || e);
      alert("저장 실패");
    }
  };


  // 날짜
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const middleWaypointCount = waypoints.filter(w => (w?.address || "").trim() !== "").length;

  return (
    <Grid container sx={{ bgcolor: theme.palette.background.default}}>
      <Grid size={3} />
      <Grid size={6} marginBottom={"5%"}>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <CommonTitle>예상 금액 계산 &nbsp;</CommonTitle>
          <LocalShippingOutlinedIcon sx={{ fontSize: "40px", color: theme.palette.primary.main }} />
        </Box>


        <CommonList padding={5}>
          {/* 주소 입력 */}
          <ButtonContainer marginBottom={5}>
            <Three100Buttons
              leftTitle={"집하지 검색"}
              leftClickEvent={() => openAddressPopup(setHubAddress)}
              middleTitle={"최종 목적지 검색"}
              middleClickEvent={() => openAddressPopup(setFinalAddress)}
              rightTitle={"경유지 추가"}
              rightClickEvent={addWaypoint}

              gap={2}
            />
          </ButtonContainer>

          <div className="form-row">집하지: {hubAddress || "(미입력)"}</div>

          {waypoints.map((w, i) => (
            <div key={i} className="form-row" style={{ display: "flex", justifyContent: "space-between" }}>
              {i + 1}번 경유지: {w.address || "주소 없음"} /{" "}
              {w.cargo ? `${w.cargo.description}, ${w.cargo.weightKg}kg` : "화물 없음"}
              <ThreeButtons
                leftTitle={"주소 입력"}
                leftClickEvent={() => openWaypointAddress(i)}

                middleTitle={"화물 입력"}
                middleClickEvent={() => setCargoDialogIdx(i)}

                rightTitle={"경유지 삭제"}
                rightClickEvent={() => handleRemoveWaypoint(i)}
                rightColor={theme.palette.error.main}

                gap={1}
              />
            </div>

          ))}

          <div className="form-row" style={{ display: "flex", justifyContent: "space-between" }}>
            최종 목적지: {finalAddress || "(미입력)"}{" "}
            {finalCargo ? `/ 화물: ${finalCargo.description}, ${finalCargo.weightKg}kg` : ""}
            <OneButtonAtRight clickEvent={() => setCargoDialogIdx("final")}>
              최종 목적지 화물 입력
            </OneButtonAtRight>
          </div>

          {/* 거리/요금 & 기본 주소 */}
          <ButtonContainer marginBottom={"5%"} marginTop={"5%"}>
            <TwoButtonsAtEnd
              leftTitle={"거리 및 금액 계산"}
              leftClickEvent={handleCalculateDistance}
              rightTitle={"기본주소로 설정"}
              rightClickEvent={saveDefaultAddress}
            />
          </ButtonContainer>


          {savedAddresses.length > 0 && (
            <div className="info-section">
              <p>📌 저장된 기본 주소</p>
              {savedAddresses.map((addr) => (
                <div key={addr.id}>
                  {addr.type}: {addr.value}
                  <button onClick={() => applySavedAddress(addr.value)} style={{ marginLeft: 8 }}>
                    적용
                  </button>
                  <button onClick={removeDefaultAddress} style={{ marginLeft: 8 }}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasCalculated ? (
            <div className="info-section">
              <CommonSmallerTitle>상세 운송 내역</CommonSmallerTitle>
              <ul style={{ marginTop: 6, lineHeight: 1.6 }}>
                <li>예상 거리: {Number(Math.floor(distance) || 0)} km</li>
                <li>총 화물 개수: {totalCargoCount} 개</li>
                <li>총 화물 무게: {totalCargoWeight} kg</li>
              </ul>

              <CommonSmallerTitle>상세 요금 내역</CommonSmallerTitle>
              <ul style={{ marginTop: 6, lineHeight: 1.6 }}>
                <li>기본 요금: 100,000원</li>
                <li>거리 요금: {distanceOnlyPrice.toLocaleString()}원</li>
                <li>무게 요금 (톤당 30,000): {(weight * 30000).toLocaleString()}원</li>
                {hasCareful && <li>취급주의 추가요금: +50,000원</li>}
                {hasMountain && <li>산간지역 추가요금: +50,000원</li>}
                {middleWaypointCount > 0 && (
                  <li>
                    경유지 추가요금 ({middleWaypointCount}개 × 50,000):{" "}
                    {(middleWaypointCount * 50000).toLocaleString()}원
                  </li>
                )}
              </ul>

              <CommonSmallerTitle>
                총 예상 금액: {Number(price || 0).toLocaleString()}원
              </CommonSmallerTitle>
            </div>
          ) : (
            <div className="info-section">
              <p>상세 운송/요금 내역</p>
              <p style={{ color: "#666" }}>
                집하지/최종 목적지를 입력하고 &ldquo;거리 및 금액 계산&rdquo;을 눌러주세요.
              </p>
            </div>
          )}

          {/* 차량 선택 */}
          <div className="form-row">
            <select className="customInput" value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
              <option value="">차량 선택</option>
              {vehicleTypes.map((v) => (
                <option
                  key={v.id ?? v.vehicleTypeId ?? v.vehicle_type_id}
                  value={v.id ?? v.vehicleTypeId ?? v.vehicle_type_id}
                >
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 */}
          <p className="delivery-label">배송 희망 날짜 :</p>
          <div className="datepicker-row">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="출발 날짜"
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="customInput"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="도착 날짜"
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="customInput"
            />
          </div>

          {/* 액션 */}
          <Two100Buttons
            leftTitle={"기사님 검색"}
            leftClickEvent={goDriverSearch}
            rightTitle={"요청하기"}
            rightClickEvent={handleConfirmPayment}

            gap={1}
          />

          {/* 다이얼로그 */}
          {cargoDialogIdx != null && (
            <CargoDialog
              open={cargoDialogIdx != null}
              onClose={() => setCargoDialogIdx(null)}
              onSave={handleSaveCargo}
              options={cargoTypeOptions}
              initialCargo={
                cargoDialogIdx === "final"
                  ? finalCargo || null
                  : (typeof cargoDialogIdx === "number" ? waypoints[cargoDialogIdx]?.cargo || null : null)
              }
            />
          )}
        </CommonList>
      </Grid>
      <Grid size={3} />
    </Grid>
  );
};

export default EstimateForm_new;