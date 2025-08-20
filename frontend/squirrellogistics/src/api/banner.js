// src/api/banner.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// API 클라이언트 설정
const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  },

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// 배너 목록 조회 (필터링, 정렬, 페이지네이션 지원)
export async function fetchBanners({ 
  keyword = "", 
  status = "", 
  position = "", 
  sortBy = "order",
  sortOrder = "asc",
  page = 0,
  pageSize = 50
} = {}) {
  try {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    if (position) params.append('position', position);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (page !== undefined) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);

    const endpoint = `/banners?${params.toString()}`;
    const result = await apiClient.get(endpoint);
    
    // 백엔드 응답 구조에 맞춰 조정
    return {
      data: result,
      pagination: {
        page,
        pageSize,
        total: result.length,
        totalPages: Math.ceil(result.length / pageSize),
        hasNext: (page + 1) * pageSize < result.length,
        hasPrev: page > 0
      }
    };
  } catch (error) {
    console.error("배너 목록 조회 실패:", error);
    throw new Error("배너 목록을 불러오는데 실패했습니다.");
  }
}

// 단일 배너 조회
export async function getBanner(id) {
  try {
    const result = await apiClient.get(`/banners/${id}`);
    return result;
  } catch (error) {
    console.error("배너 조회 실패:", error);
    throw new Error("배너 정보를 불러오는데 실패했습니다.");
  }
}

// 배너 생성
export async function createBanner(payload) {
  try {
    // 프론트엔드 데이터를 기존 DTO 형식에 맞춰 변환
    const requestData = {
      adminId: 1, // 실제로는 로그인된 관리자 ID 사용
      title: payload.title,
      imageUrl: payload.imageUrl,
      isActive: payload.status === "ACTIVE"
    };

    const result = await apiClient.post('/banners', requestData);
    return result;
  } catch (error) {
    console.error("배너 생성 실패:", error);
    throw new Error("배너 생성에 실패했습니다.");
  }
}

// 배너 수정
export async function updateBanner(id, payload) {
  try {
    // 프론트엔드 데이터를 기존 DTO 형식에 맞춰 변환
    const requestData = {
      adminId: 1, // 실제로는 로그인된 관리자 ID 사용
      title: payload.title,
      imageUrl: payload.imageUrl,
      isActive: payload.status === "ACTIVE"
    };

    const result = await apiClient.put(`/banners/${id}`, requestData);
    return result;
  } catch (error) {
    console.error("배너 수정 실패:", error);
    throw new Error("배너 수정에 실패했습니다.");
  }
}

// 배너 삭제
export async function deleteBanner(id) {
  try {
    await apiClient.delete(`/banners/${id}`);
    return true;
  } catch (error) {
    console.error("배너 삭제 실패:", error);
    throw new Error("배너 삭제에 실패했습니다.");
  }
}

// 배너 상태 토글
export async function toggleBannerStatus(id) {
  try {
    const result = await apiClient.put(`/banners/${id}/toggle`);
    return result;
  } catch (error) {
    console.error("배너 상태 변경 실패:", error);
    throw new Error("상태 변경에 실패했습니다.");
  }
}

// 배너 순서 변경 (간단한 방식)
export async function reorderBanners(nextOrders) {
  try {
    if (!Array.isArray(nextOrders) || nextOrders.length === 0) {
      throw new Error("유효하지 않은 순서 정보입니다.");
    }
    
    const orderRequests = nextOrders.map(o => ({
      id: o.id,
      order: o.order
    }));

    await apiClient.post('/banners/reorder', orderRequests);
    return true;
  } catch (error) {
    console.error("배너 순서 변경 실패:", error);
    throw new Error("순서 변경에 실패했습니다.");
  }
}

// 일괄 배너 업데이트 (간단한 방식)
export async function bulkUpdateBanners(updates) {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error("유효하지 않은 업데이트 정보입니다.");
    }
    
    const bulkRequests = updates.map(update => ({
      id: update.id,
      status: update.status
    }));

    await apiClient.post('/banners/bulk', bulkRequests);
    return true;
  } catch (error) {
    console.error("일괄 배너 업데이트 실패:", error);
    throw new Error("일괄 업데이트에 실패했습니다.");
  }
}

// 배너 통계 업데이트 (간단한 방식)
export async function updateBannerStats(id, type) {
  try {
    const params = new URLSearchParams({ type });
    await apiClient.post(`/banners/${id}/stats?${params.toString()}`);
    return true;
  } catch (error) {
    console.error("배너 통계 업데이트 실패:", error);
    throw new Error("통계 업데이트에 실패했습니다.");
  }
}

// 배너 통계 조회 (간단한 방식)
export async function getBannerStats() {
  try {
    const result = await apiClient.get('/banners/stats');
    return result;
  } catch (error) {
    console.error("배너 통계 조회 실패:", error);
    throw new Error("통계 정보를 불러오는데 실패했습니다.");
  }
}

// 데이터 내보내기
export async function exportBanners(format = "json") {
  try {
    const params = new URLSearchParams({ format });
    const result = await apiClient.get(`/banners/export?${params.toString()}`);
    return result;
  } catch (error) {
    console.error("배너 내보내기 실패:", error);
    throw new Error("데이터 내보내기에 실패했습니다.");
  }
}

// 개발용 로컬 스토리지 폴백 (백엔드 연결 실패 시)
const STORAGE_KEY = "squirrel_banners_v2_fallback";

function readFallback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFallback(data) {
  try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("로컬 스토리지 쓰기 실패:", error);
    return false;
  }
}

// 초기 데이터 생성 (개발용, 기존 DTO 구조에 맞춤)
function seedFallbackIfEmpty() {
  const data = readFallback();
  if (data.length === 0) {
    const seed = [
      {
        bannerId: 1,
        title: "신규 가입 프로모션",
        imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
        isActive: true,
        regDate: new Date().toISOString(),
        modiDate: new Date().toISOString(),
        adminUser: null
      },
      {
        bannerId: 2,
        title: "여름 특가 이벤트",
        imageUrl: "https://images.unsplash.com/photo-1496302662116-85c36ea1c611?q=80&w=800&auto=format&fit=crop",
        isActive: false,
        regDate: new Date().toISOString(),
        modiDate: new Date().toISOString(),
        adminUser: null
      },
    ];
    
    writeFallback(seed);
  }
}

// 폴백 데이터 초기화
seedFallbackIfEmpty();

// 에러 발생 시 폴백으로 동작하는 래퍼 함수들
export async function fetchBannersWithFallback(options) {
  try {
    return await fetchBanners(options);
  } catch (error) {
    console.warn("백엔드 연결 실패, 로컬 스토리지 사용:", error);
    const data = readFallback();
    return {
      data: data,
      pagination: {
        page: 0,
        pageSize: data.length,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

export async function getBannerWithFallback(id) {
  try {
    return await getBanner(id);
  } catch (error) {
    console.warn("백엔드 연결 실패, 로컬 스토리지 사용:", error);
    const data = readFallback();
    return data.find(b => b.bannerId == id) || null;
  }
}
