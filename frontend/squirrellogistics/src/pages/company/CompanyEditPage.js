import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompanyEditPage.css";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../slice/company/companySlice";
import useCompanyEditGuard from "../../hook/company/useCompanyEditGuard";
import useAddressSearch from "../../hook/company/useAddressSearch";

/** 국내 은행사 선택 목록 */
const BANK_OPTIONS = [
  { code: "004", name: "KB국민" },
  { code: "088", name: "신한" },
  { code: "020", name: "우리" },
  { code: "081", name: "하나" },
  { code: "011", name: "NH농협" },
  { code: "003", name: "IBK기업" },
  { code: "090", name: "카카오뱅크" },
  { code: "092", name: "토스뱅크" },
  { code: "023", name: "SC제일" },
  { code: "031", name: "DGB대구" },
  { code: "032", name: "BNK부산" },
  { code: "039", name: "BNK경남" },
  { code: "034", name: "광주" },
  { code: "037", name: "전북" },
  { code: "071", name: "우체국" },
  { code: "048", name: "신협" },
];

const findBankByCode = (code) => BANK_OPTIONS.find((b) => b.code === code);
const findBankByName = (name) => BANK_OPTIONS.find((b) => b.name === name);

const CompanyEditPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((s) => s.company.userInfo);

  // ✅ 인증 가드
  useCompanyEditGuard();

  const isSocial = useMemo(
    () => !!(userInfo?.loginProvider && userInfo.loginProvider !== "local"),
    [userInfo]
  );

  // 비밀번호 변경
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  // 은행/계좌
  const [bankCode, setBankCode] = useState("");                 // 선택값(code)
  const [bankName, setBankName] = useState(userInfo?.bankName || ""); // 표시/백업용(name)
  const [accountNumber, setAccountNumber] = useState(userInfo?.accountNumber || "");

  // 주소
  const [address, setAddress] = useState(userInfo?.address || "");
  const [addressDetail, setAddressDetail] = useState(userInfo?.addressDetail || "");

  const [saving, setSaving] = useState(false);

  // userInfo → 로컬 상태 동기화
  useEffect(() => {
    if (!userInfo) return;
    if (userInfo.bankCode) {
      setBankCode(userInfo.bankCode);
      setBankName(findBankByCode(userInfo.bankCode)?.name || userInfo.bankName || "");
    } else if (userInfo.bankName) {
      setBankName(userInfo.bankName);
      setBankCode(findBankByName(userInfo.bankName)?.code || "");
    } else {
      setBankCode("");
      setBankName("");
    }
    setAccountNumber(userInfo.accountNumber || "");
    setAddress(userInfo.address || "");
    setAddressDetail(userInfo.addressDetail || "");
  }, [userInfo]);

  // 주소 검색 훅
  const { open } = useAddressSearch();
  const openAddressSearch = () => open((addr) => setAddress(addr));

  // 🔎 변경 여부(없으면 저장 버튼 비활성화)
  const isDirty = useMemo(() => {
    const baseBankCode = userInfo?.bankCode || (userInfo?.bankName ? findBankByName(userInfo.bankName)?.code : "") || "";
    const baseBankName = userInfo?.bankName || "";
    const baseAcct = userInfo?.accountNumber || "";
    const baseAddr = userInfo?.address || "";
    const baseAddrDetail = userInfo?.addressDetail || "";

    const changedPw = !isSocial && newPw.length > 0;
    const changedBank = (bankCode || "") !== baseBankCode || (findBankByCode(bankCode)?.name || bankName) !== baseBankName;
    const changedAcct = (accountNumber || "") !== baseAcct;
    const changedAddr = (address || "") !== baseAddr || (addressDetail || "") !== baseAddrDetail;

    return changedPw || changedBank || changedAcct || changedAddr;
  }, [userInfo, isSocial, newPw, bankCode, bankName, accountNumber, address, addressDetail]);

  const handleSave = async () => {
    if (saving) return;

    // 비번 검증(로컬만)
    if (!isSocial && (newPw || newPw2)) {
      if (newPw.length < 8) { alert("비밀번호는 8자 이상으로 설정해주세요."); return; }
      if (newPw !== newPw2) { alert("새 비밀번호와 확인이 일치하지 않습니다."); return; }
    }
    // 은행/계좌/주소 검증
    if (!bankCode && !bankName) { alert("은행사를 선택해 주세요."); return; }
    if (!accountNumber) { alert("계좌번호를 입력해 주세요."); return; }
    if (!address) { alert("주소를 입력해 주세요."); return; }

    const resolvedBankName = findBankByCode(bankCode)?.name || bankName;
    const payload = {
      bankCode: bankCode || undefined,
      bankName: resolvedBankName,
      accountNumber: accountNumber.replace(/\D/g, ""), // 숫자만
      address,
      addressDetail,
      ...(isSocial ? {} : newPw ? { newPassword: newPw } : {}),
    };

    try {
      setSaving(true);
      await dispatch(updateProfile(payload)).unwrap(); // ✅ thunk 사용 → userInfo 즉시 갱신
      sessionStorage.removeItem("company_edit_verified");
      alert("정보가 변경되었습니다.");
      navigate("/company");
    } catch (e) {
      const msg = e?.response?.data?.message || "저장에 실패했습니다.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-wrap">
      <h2 className="edit-title">회원정보 수정</h2>

      <div className="edit-card">
        {/* 비밀번호(소셜은 비활성화) */}
        <div className="field-group">
          <label className="label">new Password</label>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            disabled={isSocial}
            className="input"
          />
        </div>
        <div className="field-group">
          <label className="label">check Password</label>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={newPw2}
            onChange={(e) => setNewPw2(e.target.value)}
            disabled={isSocial}
            className="input"
          />
        </div>
        {isSocial && <p className="hint">※ 구글/카카오 로그인 사용자는 비밀번호 변경이 비활성화됩니다.</p>}

        {/* 계좌 */}
        <div className="field-group">
          <label className="label">계좌번호 변경하기</label>
          <div className="row">
            <select
              className="input bank-select"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            >
              <option value="">은행사 선택</option>
              {BANK_OPTIONS.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>

            <input
              className="input flex1"
              placeholder="계좌번호 (- 없이 숫자만)"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {/* 주소 */}
        <div className="field-group">
          <label className="label">주소 변경하기</label>
          <div className="row">
            <input
              className="input flex1"
              placeholder="주소"
              value={address}
              readOnly
            />
            <button className="ghost-btn" onClick={openAddressSearch}>주소 검색하기</button>
          </div>
        </div>

        <div className="field-group">
          <label className="label">상세주소</label>
          <input
            className="input"
            placeholder="상세주소"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
          />
        </div>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !isDirty}
          title={!isDirty ? "변경된 내용이 없습니다." : ""}
        >
          {saving ? "저장 중..." : "정보 변경하기"}
        </button>
      </div>
    </div>
  );
};

export default CompanyEditPage;
