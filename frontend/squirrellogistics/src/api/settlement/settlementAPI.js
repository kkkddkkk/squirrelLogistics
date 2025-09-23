import axios from "axios";
import dayjs from "dayjs";
import { buildConfig } from "../deliveryRequest/apiUtil";
import { API_SERVER_HOST } from "../deliveryRequest/deliveryRequestAPI";

//작성자: 고은설.
//기능: 관리자 => 정산 대시보드 및 미정산 처리 위한 백단 연결 API.

const BASE = `${API_SERVER_HOST}/api/settlements`;

//======================================[HELPER].
// YYYY-MM 문자열.
const ym = (v) => dayjs(v).format("YYYY-MM");
// ISO8601 문자.
const iso = (v) => (v ? dayjs(v).toISOString() : undefined);

//======================================[API].
export const settlementApi = {

    //사용처: 관리자 정산 대시보드 최상단 집계 카드.
    //기능: 이번달 총매출, 수수료, 순정산 집계 후 백으로부터 전달.
    async getMonthlySummary({ month }, options = {}) {
        const { data } = await axios.get(
            `${BASE}/summary`,
            buildConfig({ params: { month: ym(month) }, ...options })
        );
        return data; // 반환:{ month, gross, fee, net, completedCount }
    },

    //사용처: 관리자 정산 대시보드 최상단, 최하단 미정산 내역 버튼.
    //기능: 완료된 결제건 중 정산되지 않은 전기간 모든 데이터 갯수, 금액 합 백으로부터 전달.
    async getUnsettledSummary(options = {}) {
        const { data } = await axios.get(
            `${BASE}/unsettled`,
            buildConfig(options)
        );
        return data; // 반환:{ count, amount }
    },

    //사용처: 관리자 정산 대시보드 섹션1의 결제수단별 매출 비교 막대 그래프.
    //기능: 시작~종료 범위 내 결제수단별 총매출, 수수료, 순정산 백으로부터 전달.
    async getByMethod({ from, to }, options = {}) {
        const { data } = await axios.get(
            `${BASE}/by-method`,
            buildConfig({ params: { from: iso(from), to: iso(to) }, ...options })
        );
        return data; // 반환:[{ method, gross, fee, net }]
    },

    //사용처: 관리자 정산 대시보드 섹션2의 기간별 매출 비교 라인 그래프.
    //기능: 시작~종료 범위 내 총매출, 수수료, 순정산 백으로부터 전달.
    async getTrend({ from, to, interval }, options = {}) {
        const { data } = await axios.get(
            `${BASE}/trend`,
            buildConfig({
                params: { from: iso(from), to: iso(to), interval }, // DAY|WEEK|MONTH
                ...options,
            })
        );
        return data; // 반환:[{ bucket, label, gross, fee, net }]
    },

    //사용처: 관리자 미정산 내역 관리 페이지.
    //기능: 시작~종료 범위 내 결제 완료 + 미정산 상태 데이터 페이징 처리 후 백으로부터 전달.
    async getPayments(
        { from, to, method = "all", settle = "unsettled", page = 1, size = 10, sortKey = "paid,DESC" },
        options = {}
    ) {
        const { data } = await axios.get(
            `${BASE}/payments`,
            buildConfig({
                params: { from: iso(from), to: iso(to), method, settle, page, size, sortKey },
                ...options,
            })
        );
        return data; // RequestPageResponseDTO<PaymentDTO>
    },
    //사용처: 관리자 미정산 내역 관리 페이지.
    //기능: 선택 정산 마감 (개별 수수료 override 전달 가능)
    settlePayments: async ({ ids, merchantFeeOverrideById, driverFeeOverrideById }, options = {}) => {
        const { data } = await axios.post(
            `${BASE}/settle`,
            { ids, merchantFeeOverrideById, driverFeeOverrideById },
            buildConfig(options)
        );
        return data; // 반환: { updated, batchId }
    },
};