import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "김동현",
    birth: "1989-02-19",
    phone: "010-2342-2342",
    email: "driver119@naver.com",
    bankAccount: "3333-1988-67613",
    businessId: "123-222-2342",
    unavailableStart: "2025-08-10",
    unavailableEnd: "2025-08-20",
    deliveryArea: "서울 전체",
    rating: 4.8,
  });

  const [emailError, setEmailError] = useState("");
  const [selectedCity, setSelectedCity] = useState("서울");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(["서울 전체"]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("은행 선택");
  const [activeTab, setActiveTab] = useState("bank");

  // 은행 데이터
  const banks = [
    { name: "NH농협", logo: "🏦" },
    { name: "KB국민", logo: "🏦" },
    { name: "신한", logo: "🏦" },
    { name: "우리", logo: "🏦" },
    { name: "하나", logo: "🏦" },
    { name: "IBK기업", logo: "🏦" },
    { name: "부산", logo: "🏦" },
    { name: "경남", logo: "🏦" },
    { name: "대구", logo: "🏦" },
    { name: "우체국", logo: "🏦" },
    { name: "새마을금고", logo: "🏦" },
    { name: "SC제일", logo: "🏦" },
  ];

  // 증권사 데이터
  const securities = [
    { name: "NH투자증권", logo: "📈" },
    { name: "KB증권", logo: "📈" },
    { name: "신한투자증권", logo: "📈" },
    { name: "우리투자증권", logo: "📈" },
    { name: "하나증권", logo: "📈" },
    { name: "IBK투자증권", logo: "📈" },
  ];

  // 도시별 구/군 데이터
  const cityDistricts = {
    서울: [
      "서울 전체",
      "강남구",
      "강동구",
      "강북구",
      "강서구",
      "관악구",
      "광진구",
      "구로구",
      "금천구",
      "노원구",
      "도봉구",
      "동대문구",
      "동작구",
      "마포구",
      "서대문구",
      "서초구",
      "성동구",
      "성북구",
      "송파구",
      "양천구",
      "영등포구",
      "용산구",
      "은평구",
      "종로구",
      "중구",
      "중랑구",
    ],
    인천: [
      "인천 전체",
      "계양구",
      "남구",
      "남동구",
      "동구",
      "부평구",
      "서구",
      "연수구",
      "중구",
      "강화군",
      "옹진군",
    ],
    부산: [
      "부산 전체",
      "강서구",
      "금정구",
      "남구",
      "동구",
      "동래구",
      "부산진구",
      "북구",
      "사상구",
      "사하구",
      "서구",
      "수영구",
      "연제구",
      "영도구",
      "중구",
      "해운대구",
      "기장군",
    ],
    대구: [
      "대구 전체",
      "남구",
      "달서구",
      "달성군",
      "동구",
      "북구",
      "서구",
      "수성구",
      "중구",
    ],
    광주: ["광주 전체", "광산구", "남구", "동구", "북구", "서구"],
    대전: ["대전 전체", "대덕구", "동구", "서구", "유성구", "중구"],
    울산: ["울산 전체", "남구", "동구", "북구", "울주군", "중구"],
    세종: ["세종 전체"],
    경기: [
      "경기 전체",
      "수원시",
      "성남시",
      "의정부시",
      "안양시",
      "부천시",
      "광명시",
      "평택시",
      "동두천시",
      "안산시",
      "고양시",
      "과천시",
      "구리시",
      "남양주시",
      "오산시",
      "시흥시",
      "군포시",
      "의왕시",
      "하남시",
      "용인시",
      "파주시",
      "이천시",
      "안성시",
      "김포시",
      "화성시",
      "광주시",
      "여주시",
      "양평군",
      "고양군",
      "연천군",
      "포천군",
      "가평군",
    ],
    강원: [
      "강원 전체",
      "춘천시",
      "원주시",
      "강릉시",
      "동해시",
      "태백시",
      "속초시",
      "삼척시",
      "홍천군",
      "횡성군",
      "영월군",
      "평창군",
      "정선군",
      "철원군",
      "화천군",
      "양구군",
      "인제군",
      "고성군",
      "양양군",
    ],
    충북: [
      "충북 전체",
      "청주시",
      "충주시",
      "제천시",
      "보은군",
      "옥천군",
      "영동군",
      "증평군",
      "진천군",
      "괴산군",
      "음성군",
      "단양군",
    ],
    충남: [
      "충남 전체",
      "천안시",
      "공주시",
      "보령시",
      "아산시",
      "서산시",
      "논산시",
      "계룡시",
      "당진시",
      "금산군",
      "부여군",
      "서천군",
      "청양군",
      "홍성군",
      "예산군",
      "태안군",
    ],
    전북: [
      "전북 전체",
      "전주시",
      "군산시",
      "익산시",
      "정읍시",
      "남원시",
      "김제시",
      "완주군",
      "진안군",
      "무주군",
      "장수군",
      "임실군",
      "순창군",
      "고창군",
      "부안군",
    ],
    전남: [
      "전남 전체",
      "목포시",
      "여수시",
      "순천시",
      "나주시",
      "광양시",
      "담양군",
      "곡성군",
      "구례군",
      "고흥군",
      "보성군",
      "화순군",
      "장흥군",
      "강진군",
      "해남군",
      "영암군",
      "무안군",
      "함평군",
      "영광군",
      "장성군",
      "완도군",
      "진도군",
      "신안군",
    ],
    경북: [
      "경북 전체",
      "포항시",
      "경주시",
      "김천시",
      "안동시",
      "구미시",
      "영주시",
      "영천시",
      "상주시",
      "문경시",
      "경산시",
      "군위군",
      "의성군",
      "청송군",
      "영양군",
      "영덕군",
      "청도군",
      "고령군",
      "성주군",
      "칠곡군",
      "예천군",
      "봉화군",
      "울진군",
      "울릉군",
    ],
    경남: [
      "경남 전체",
      "창원시",
      "진주시",
      "통영시",
      "사천시",
      "김해시",
      "밀양시",
      "거제시",
      "양산시",
      "의령군",
      "함안군",
      "창녕군",
      "고성군",
      "남해군",
      "하동군",
      "산청군",
      "함양군",
      "거창군",
      "합천군",
    ],
    제주: ["제주 전체", "제주시", "서귀포시"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let formatted = value.replace(/[^0-9]/g, "");
      if (formatted.length < 4) {
        formatted = formatted;
      } else if (formatted.length < 8) {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
      } else {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(
          3,
          7
        )}-${formatted.slice(7, 11)}`;
      }
      setForm((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === "email") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(isValidEmail ? "" : "이메일 형식이 올바르지 않습니다.");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 도시 선택 핸들러
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  // 구/군 선택 핸들러
  const handleDistrictSelect = (district) => {
    // 이미 선택된 지역인지 확인
    if (!selectedAreas.includes(district)) {
      setSelectedAreas((prev) => [...prev, district]);
      setForm((prev) => ({
        ...prev,
        deliveryArea: [...selectedAreas, district].join(", "),
      }));
    }
    setShowDistrictDropdown(false);
  };

  // 지역 삭제 핸들러
  const removeArea = (areaToRemove) => {
    const updatedAreas = selectedAreas.filter((area) => area !== areaToRemove);
    setSelectedAreas(updatedAreas);
    setForm((prev) => ({
      ...prev,
      deliveryArea: updatedAreas.join(", "),
    }));
  };

  // 은행/증권사 선택 핸들러
  const handleBankSelect = (bank) => {
    setSelectedBank(bank.name);
    setShowBankModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailError) {
      alert("이메일 형식을 확인해주세요.");
      return;
    }
    alert("수정이 완료되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#113F67]">
          회원 정보 수정
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="이름"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <InputField
            label="생년월일"
            name="birth"
            type="date"
            value={form.birth}
            onChange={handleChange}
          />
          <InputField
            label="연락처"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <div>
            <InputField
              label="이메일"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* 계좌번호 입력 필드 */}
          <div>
            <label className="block mb-1 text-sm font-medium">계좌번호</label>
            <div className="flex gap-2">
              {/* 은행 선택 버튼 */}
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67] text-left bg-white"
              >
                {selectedBank}
              </button>

              {/* 계좌번호 입력 */}
              <input
                type="text"
                name="bankAccount"
                value={form.bankAccount}
                onChange={handleChange}
                placeholder="계좌번호 입력"
                className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67]"
              />
            </div>
          </div>

          <InputField
            label="사업자 등록 번호"
            name="businessId"
            value={form.businessId}
            onChange={handleChange}
          />
          <InputField
            label="운행 불가 시작일"
            name="unavailableStart"
            type="date"
            value={form.unavailableStart}
            onChange={handleChange}
          />
          <InputField
            label="운행 불가 종료일"
            name="unavailableEnd"
            type="date"
            value={form.unavailableEnd}
            onChange={handleChange}
          />

          {/* 배송 가능 지역 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">배송 가능 지역</label>

            {/* 도시 선택 */}
            <div>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67]"
              >
                {Object.keys(cityDistricts).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 구/군 선택 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67] text-left bg-white"
              >
                구/군을 선택하세요
              </button>

              {showDistrictDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {cityDistricts[selectedCity].map((district, index) => (
                    <div
                      key={index}
                      onClick={() => handleDistrictSelect(district)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {district}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 선택된 지역들 표시 */}
            {selectedAreas.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">선택된 지역:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{area}</span>
                      <button
                        type="button"
                        onClick={() => removeArea(area)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate("/driver/profile")}
              className="px-4 py-2 text-sm border border-gray-400 rounded hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#113F67] text-white rounded hover:opacity-90"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>

      {/* 은행/증권사 선택 모달 */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">은행·증권사 선택</h2>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "bank"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500"
                }`}
              >
                은행
              </button>
              <button
                onClick={() => setActiveTab("securities")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "securities"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500"
                }`}
              >
                증권사
              </button>
            </div>

            {/* 은행/증권사 그리드 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {activeTab === "bank"
                  ? banks.map((bank, index) => (
                      <div
                        key={index}
                        onClick={() => handleBankSelect(bank)}
                        className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg mb-2">
                          {bank.logo}
                        </div>
                        <span className="text-xs text-center">{bank.name}</span>
                      </div>
                    ))
                  : securities.map((security, index) => (
                      <div
                        key={index}
                        onClick={() => handleBankSelect(security)}
                        className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg mb-2">
                          {security.logo}
                        </div>
                        <span className="text-xs text-center">
                          {security.name}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => (
  <header className="bg-[#F5F7FA] p-4 border-b">
    <h1 className="text-xl font-bold text-[#113F67]">Squirrel Logistics</h1>
  </header>
);

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67]"
    />
  </div>
);

export default EditProfile;
