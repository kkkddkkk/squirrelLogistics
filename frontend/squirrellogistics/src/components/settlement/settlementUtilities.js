import dayjs from "dayjs";

// const METHOD_FEE_RULE = {
//   kakaopay: { pct: 0.035, plus: 100 },
//   card: { pct: 0.029, plus: 100 },
//   transfer: { pct: 0.0, plus: 0 },
// };

// function delay(ms) {
//   return new Promise((res) => setTimeout(res, ms));
// }

// function startOfISOWeek(d) {
//   const day = d.day(); // 0=일,1=월
//   const diff = day === 0 ? -6 : 1 - day;
//   return d.add(diff, "day").startOf("day");
// }


//export const COMPLETED_STATUSES = new Set(["COMPLETED", "ALLCOMPLETED"]);

export const currency = (n) => (n ?? 0).toLocaleString();

// export function autoCalcFee(amount, method) {
//   const r = METHOD_FEE_RULE[method] || { pct: 0.03, plus: 0 };
//   // Fees never negative; 2차 음수(환불)는 0 처리 (운영정책 가정)
//   const base = Math.max(0, amount);
//   return Math.round(base * r.pct + r.plus);
// }

// export function isCompleted(p) {
//   return COMPLETED_STATUSES.has(p.pay_status);
// }

// export function aggregateMetrics(payments) {
//   const completed = payments.filter(isCompleted);
//   const gross = completed.reduce((acc, p) => acc + (p.pay_amount || 0), 0);
//   const fee = completed.reduce((acc, p) => acc + (p.settlement_fee || 0), 0);
//   const net = gross - fee;
//   const unsettled = completed.filter((p) => !p.settlement);
//   const unsettledAmount = unsettled.reduce((acc, p) => acc + (p.pay_amount || 0), 0);


//   const byMethod = {};
//   for (const p of completed) {
//     const key = p.pay_method || "unknown";
//     byMethod[key] ||= { method: key, gross: 0, fee: 0, net: 0 };
//     byMethod[key].gross += p.pay_amount || 0;
//     byMethod[key].fee += p.settlement_fee || 0;
//     byMethod[key].net = byMethod[key].gross - byMethod[key].fee;
//   }


//   return {
//     gross,
//     fee,
//     net,
//     unsettledCount: unsettled.length,
//     unsettledAmount,
//     byMethod: Object.values(byMethod),
//   };
// }

// export function buildMonthBuckets(from, to) {
//   const start = dayjs(from).startOf("month");
//   const end = dayjs(to).endOf("month");
//   const buckets = [];
//   let cur = start;
//   while (cur.isBefore(end) || cur.isSame(end, "month")) {
//     buckets.push(cur.format("YYYY-MM")); // e.g., 2025-09
//     cur = cur.add(1, "month");
//   }
//   return buckets;
// }

// export function buildSeriesByInterval(payments, from, to, interval) {
//   const done = new Set(["COMPLETED", "ALLCOMPLETED"]);
//   const rows = payments.filter(p => done.has(p.pay_status));

//   // 버킷 키/라벨 빌더
//   const buckets = [];
//   if (interval === "DAY") {
//     let cur = from.startOf("day");
//     const end = to.endOf("day");
//     while (cur.isBefore(end) || cur.isSame(end)) {
//       buckets.push({ key: cur.format("YYYY-MM-DD"), label: cur.format("MM.DD") });
//       cur = cur.add(1, "day");
//     }
//   } else if (interval === "WEEK") {
//     let cur = startOfISOWeek(from);
//     const end = startOfISOWeek(to);
//     while (cur.isBefore(end) || cur.isSame(end)) {
//       buckets.push({ key: cur.format("YYYY-MM-DD"), label: cur.format("MM.DD") }); // 주 시작일 라벨
//       cur = cur.add(1, "week");
//     }
//   } else { // MONTH
//     let cur = from.startOf("month");
//     const end = to.endOf("month");
//     while (cur.isBefore(end) || cur.isSame(end, "month")) {
//       buckets.push({ key: cur.format("YYYY-MM"), label: cur.format("YYYY.MM") });
//       cur = cur.add(1, "month");
//     }
//   }

//   const map = new Map(buckets.map(b => [b.key, { ...b, gross: 0, fee: 0, net: 0 }]));

//   for (const p of rows) {
//     const paid = dayjs(p.paid);
//     let key;
//     if (interval === "DAY") key = paid.format("YYYY-MM-DD");
//     else if (interval === "WEEK") key = startOfISOWeek(paid).format("YYYY-MM-DD");
//     else key = paid.format("YYYY-MM");
//     if (!map.has(key)) continue;
//     const node = map.get(key);
//     const gross = Number(p.pay_amount || 0);
//     const fee = Number(p.settlement_fee || 0);
//     node.gross += gross;
//     node.fee += fee;
//     node.net = node.gross - node.fee;
//   }

//   return buckets.map(b => map.get(b.key));
// }

// helpers for trend gap fill
export function makeBuckets({ from, to, interval }) {
  const dFrom = dayjs(from);
  const dTo = dayjs(to);
  const step =
    interval === "DAY" ? "day" : interval === "WEEK" ? "week" : "month";

  const fmt =
    interval === "DAY" ? "YYYY-MM-DD"
    : interval === "WEEK" ? "YYYY-[W]ww"
    : "YYYY-MM"; // MONTH

  const buckets = [];
  let cursor = dFrom.startOf(step);
  const end = dTo.endOf(step);

  while (cursor.isBefore(end) || cursor.isSame(end)) {
    buckets.push({
      // label은 백엔드와 동일 포맷 유지
      label: cursor.format(fmt),
      gross: 0, fee: 0, net: 0,
    });
    cursor = cursor.add(1, step);
  }
  return buckets;
}

export function fillTrendGaps(rows, trend) {
  const base = makeBuckets(trend);
  const idx = new Map(rows.map(r => [r.label, r]));
  return base.map(b => idx.get(b.label) ? { ...b, ...idx.get(b.label) } : b);
}