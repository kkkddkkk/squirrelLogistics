import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/driver/NavBar";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setDriver({
      name: "김동현",
      birth: "1989.02.19",
      phone: "010-2342-2342",
      email: "driver119@naver.com",
      bankAccount: "3333-1988-67613",
      businessId: "123-222-2342",
      unavailableStart: "2025-08-10",
      unavailableEnd: "2025-08-20",
      deliveryArea: "서울, 경기, 인천",
      rating: 4.8,
    });

    // 여러 대의 차량 정보 설정
    setVehicles([
      {
        id: 1,
        registrationDate: "2023.01.15",
        vehicleNumber: "24가 2839",
        vehicleType: "윙바디 탑차",
        loadCapacity: "3~5톤",
        vehicleStatus: "운행 가능",
        insuranceStatus: "유",
        currentDistance: "35,090 km",
        lastInspection: "2024.09.03",
        nextInspection: "2025.08.03",
        icon: "🚛",
      },
      {
        id: 2,
        registrationDate: "2022.06.20",
        vehicleNumber: "12나 4567",
        vehicleType: "카고 트럭",
        loadCapacity: "1~2톤",
        vehicleStatus: "정비중",
        insuranceStatus: "유",
        currentDistance: "28,450 km",
        lastInspection: "2024.11.15",
        nextInspection: "2025.11.15",
        icon: "🚚",
      },
      {
        id: 3,
        registrationDate: "2021.12.10",
        vehicleNumber: "34다 7890",
        vehicleType: "냉장 탑차",
        loadCapacity: "5톤",
        vehicleStatus: "운행 가능",
        insuranceStatus: "유",
        currentDistance: "42,300 km",
        lastInspection: "2024.08.20",
        nextInspection: "2025.08.20",
        icon: "❄️",
      },
    ]);
  }, []);

  const nextVehicle = () => {
    setSlideDirection("next");
    setCurrentVehicleIndex((prev) =>
      prev === vehicles.length - 1 ? 0 : prev + 1
    );
  };

  const prevVehicle = () => {
    setSlideDirection("prev");
    setCurrentVehicleIndex((prev) =>
      prev === 0 ? vehicles.length - 1 : prev - 1
    );
  };

  const goToVehicle = (index) => {
    setSlideDirection(index > currentVehicleIndex ? "next" : "prev");
    setCurrentVehicleIndex(index);
  };

  if (!driver || vehicles.length === 0) return <div>Loading...</div>;

  const currentVehicle = vehicles[currentVehicleIndex];

  const handleWithdraw = () => {
    const confirmed = window.confirm(
      "정말 탈퇴하시겠습니까?\n확인을 누르면 모든 정보가 삭제됩니다."
    );
    if (confirmed) {
      // TODO: 삭제 처리 로직 구현 필요 (예: API 요청 등)
      alert("회원 정보가 삭제되었습니다.");
      navigate("/goodbye");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6 max-w-5xl mx-auto font-sans">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">나의 정보</h1>
        </header>

        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg mb-6 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xl text-gray-800">
                {driver.name} 기사님
              </p>
              <p className="text-sm text-gray-600">오늘도 안전운전하세요!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-semibold text-gray-800">
                {driver.rating}
              </span>
            </div>
            <button
              onClick={() => navigate("/driver/reviews")}
              className="text-blue-600 hover:text-blue-800 text-sm mt-1 font-medium transition-colors"
            >
              나의 리뷰 보기 ▶
            </button>
          </div>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-lg mb-6 relative border border-gray-100">
          <button
            onClick={() => navigate("/driver/editprofile")}
            className="absolute right-6 top-6 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            수정하기
          </button>
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👤</span>
            </span>
            운전자 개인 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-500">📝</span>
                <span className="font-medium text-gray-700">기본 정보</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">이름:</span>
                  <span className="font-medium">{driver.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">생년월일:</span>
                  <span className="font-medium">{driver.birth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연락처:</span>
                  <span className="font-medium">{driver.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이메일:</span>
                  <span className="font-medium">{driver.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-500">💼</span>
                <span className="font-medium text-gray-700">사업 정보</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">계좌번호:</span>
                  <span className="font-medium">{driver.bankAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">사업자번호:</span>
                  <span className="font-medium">{driver.businessId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">운행불가:</span>
                  <span className="font-medium">
                    {driver.unavailableStart} ~ {driver.unavailableEnd}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배송지역:</span>
                  <span className="font-medium">{driver.deliveryArea}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-lg mb-6 relative border border-gray-100">
          <button
            onClick={() => navigate("/driver/editvehicles")}
            className="absolute right-6 top-6 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            수정하기
          </button>
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🚛</span>
            </span>
            운송 차량 정보
            {vehicles.length > 1 && (
              <span className="text-sm text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                {currentVehicleIndex + 1}/{vehicles.length}
              </span>
            )}
          </h2>

          {/* 차량 슬라이더 */}
          <div className="relative overflow-hidden">
            {/* 왼쪽 화살표 */}
            {vehicles.length > 1 && (
              <button
                onClick={prevVehicle}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 z-10 transition-all duration-200 hover:scale-110"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* 차량 정보 카드 */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                slideDirection === "next"
                  ? "translate-x-full opacity-0"
                  : slideDirection === "prev"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
              onTransitionEnd={() => setSlideDirection("")}
            >
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
                {/* 차량 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{currentVehicle.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {currentVehicle.vehicleNumber}
                    </h3>
                    <p className="text-gray-600">
                      {currentVehicle.vehicleType}
                    </p>
                  </div>
                  <div
                    className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                      currentVehicle.vehicleStatus === "운행 가능"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {currentVehicle.vehicleStatus}
                  </div>
                </div>

                {/* 차량 정보 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500">📊</span>
                        <span className="font-medium text-gray-700">
                          운행 정보
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">주행거리:</span>
                          <span className="font-medium">
                            {currentVehicle.currentDistance}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">적재용량:</span>
                          <span className="font-medium">
                            {currentVehicle.loadCapacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">🔧</span>
                        <span className="font-medium text-gray-700">
                          정비 정보
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">마지막 정비:</span>
                          <span className="font-medium">
                            {currentVehicle.lastInspection}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">다음 정비:</span>
                          <span className="font-medium">
                            {currentVehicle.nextInspection}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">보험:</span>
                          <span className="font-medium">
                            {currentVehicle.insuranceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 화살표 */}
            {vehicles.length > 1 && (
              <button
                onClick={nextVehicle}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 z-10 transition-all duration-200 hover:scale-110"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 차량 인디케이터 */}
          {vehicles.length > 1 && (
            <div className="flex justify-center mt-6 space-x-3">
              {vehicles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToVehicle(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentVehicleIndex
                      ? "bg-blue-500 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        <div className="text-center mt-6">
          <button
            onClick={handleWithdraw}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            탈퇴하기
          </button>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-8">
          FOOTER
        </footer>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-[#F5F7FA] p-4 border-b">
    <h1 className="text-xl font-bold text-[#113F67]">Squirrel Logistics</h1>
  </header>
);

export default DriverProfile;
