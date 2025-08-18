// Kakao 지도 거리 계산 결과를 담는 커스텀 훅
import { useState } from "react";
import { calculateDistanceByCoords } from "../../api/estimate/estimateApi";

const useKakaoMap = () => {
  const [distance, setDistance] = useState(0);

  const getDistance = async (startCoord, endCoord) => {
    const result = calculateDistanceByCoords(startCoord, endCoord);
    setDistance(result || 0);
  };

  return { distance, getDistance };
};

export default useKakaoMap;
