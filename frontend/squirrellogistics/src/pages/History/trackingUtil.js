export function buildWaypointViews(waypoints = [], statuses = []) {
    const last = statuses.at(-1);
    const lastVisited = last?.lastVisitedWaypoint ?? -1;
    const status = last?.status ?? "ASSIGNED";

    return waypoints.map((wp, idx) => {
        let state = "대기중";

        if (idx === 0) {
            // 출발지(상차지)
            switch (status) {
                case "ASSIGNED":
                    state = "대기중"; break;
                case "MOVING_TO_PICKUP":
                    state = "집하지 이동중"; break;
                case "PICKUP_COMPLETED":
                case "MOVING_TO_WAYPOINT":
                case "ARRIVED_AT_WAYPOINT":
                case "DROPPED_AT_WAYPOINT":
                case "COMPLETED":
                    state = "집하 완료"; break;
                default:
                    state = "상차 상태 확인중"; break;
            }
        } else if (idx < lastVisited) {
            state = "운송 완료";
        } else if (idx === lastVisited) {
            if (status === "ARRIVED_AT_WAYPOINT") state = "도착";
            else if (status === "DROPPED_AT_WAYPOINT") state = "운송 완료";
            else if (status === "MOVING_TO_WAYPOINT") state = "이동중";
        }

        return {
            index: idx,
            role:
                idx === 0
                    ? "상차지"
                    : idx === waypoints.length - 1
                        ? "최종 하차지"
                        : `경유지${idx}`,
            address: wp.address ?? "-",
            state,
        };
    });
}


export function buildMainStatus(statuses = [], waypoints = []) {
    if (!statuses.length) return "운송 대기 중입니다.";

    const last = statuses.at(-1);
    const status = last?.status;
    const lastVisited = last?.lastVisitedWaypoint ?? -1;

    switch (status) {
        case "MOVING_TO_PICKUP":
            return "집하지로 이동 중입니다.";
        case "PICKUP_COMPLETED":
            return "화물이 집하 완료되었습니다.";
        case "MOVING_TO_WAYPOINT":
            return `경유지 ${lastVisited + 1}로 이동 중입니다.`;
        case "ARRIVED_AT_WAYPOINT":
            return `경유지 ${lastVisited}에 도착했습니다.`;
        case "DROPPED_AT_WAYPOINT":
            return `경유지 ${lastVisited} 하차 완료`;
        case "COMPLETED":
            return "운송이 최종 완료되었습니다.";
        case "ON_HOLD":
            return "운송이 일시 정지되었습니다.";
        default:
            return "운송 상태를 확인 중입니다.";
    }
}