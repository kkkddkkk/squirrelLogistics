// src/api/bannerApi.js
const STORAGE_KEY = "squirrel_banners_v1";

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seedIfEmpty() {
  const data = read();
  if (data.length === 0) {
    const now = new Date().toISOString().slice(0, 10);
    const later = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10);
    const seed = [
      {
        id: "1",
        title: "신규 가입 프로모션",
        position: "홈 상단",
        startDate: now,
        endDate: later,
        status: "ACTIVE",
        order: 1,
        linkUrl: "https://example.com/promo",
        imageUrl:
          "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
        memo: "첫 달 할인 배너",
      },
      {
        id: "2",
        title: "여름 특가",
        position: "홈 중단",
        startDate: now,
        endDate: later,
        status: "INACTIVE",
        order: 2,
        linkUrl: "",
        imageUrl:
          "https://images.unsplash.com/photo-1496302662116-85c36ea1c611?q=80&w=800&auto=format&fit=crop",
        memo: "",
      },
    ];
    write(seed);
  }
}
seedIfEmpty();

export async function fetchBanners({ keyword = "", status = "", position = "" } = {}) {
  const list = read()
    .filter((b) => (status ? b.status === status : true))
    .filter((b) => (position ? b.position === position : true))
    .filter((b) =>
      keyword
        ? [b.title, b.position, b.memo, b.linkUrl].some((v) =>
            String(v || "").toLowerCase().includes(keyword.toLowerCase())
          )
        : true
    )
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return Promise.resolve(list);
}

export async function getBanner(id) {
  const item = read().find((b) => b.id === id);
  return Promise.resolve(item || null);
}

export async function createBanner(payload) {
  const list = read();
  const id = String(Date.now());
  const order =
    payload.order ?? (list.length ? Math.max(...list.map((b) => b.order || 0)) + 1 : 1);
  const item = { ...payload, id, order };
  write([...list, item]);
  return Promise.resolve(item);
}

export async function updateBanner(id, payload) {
  const list = read();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return Promise.reject(new Error("배너를 찾을 수 없습니다."));
  list[idx] = { ...list[idx], ...payload };
  write(list);
  return Promise.resolve(list[idx]);
}

export async function deleteBanner(id) {
  const list = read();
  write(list.filter((b) => b.id !== id));
  return Promise.resolve(true);
}

export async function toggleBannerStatus(id) {
  const list = read();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return Promise.reject(new Error("배너를 찾을 수 없습니다."));
  list[idx].status = list[idx].status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  write(list);
  return Promise.resolve(list[idx]);
}

export async function reorderBanners(nextOrders /* [{id, order}] */) {
  const map = new Map(nextOrders.map((o) => [o.id, o.order]));
  const list = read().map((b) => (map.has(b.id) ? { ...b, order: map.get(b.id) } : b));
  write(list);
  return Promise.resolve(true);
}
