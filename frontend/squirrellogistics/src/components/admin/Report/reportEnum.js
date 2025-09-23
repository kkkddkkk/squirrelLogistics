export const switchStatus = (data) => {
    switch (data) {
        case 'PENDING': return '미확인 신고(미답변)';
        case 'IN_REVIEW': return '검토 중 신고(미답변)';
        case 'ACTION_TAKEN': return '답변 완료';
        case 'REJECTED': return '신고 반려';
        case 'CLOSED': return '상황종료'
    };
}

export const switchStatusForList = (data) => {
    switch (data) {
        case 'PENDING': return '미확인';
        case 'IN_REVIEW': return '검토 중';
        case 'ACTION_TAKEN': return '완료';
        case 'REJECTED': return '완료';
        case 'CLOSED': return '완료'
    };
}

export const switchCate = (data) => {
    switch (data) {
        case 'SERVICE': return '불만족스러운\n서비스';
        case 'VEEROFCOURSE': return '경로이탈';
        case 'DAMAGE': return '물품 파손';
        case 'UNEXECUTED': return '운송 미실행';
        case 'REVIEW': return '부적절한 리뷰';
        case 'INAPPROPRIATE': return `부적절한\n운송 요청`;
        case 'EMERGENCY': return '긴급신고';
    }
}