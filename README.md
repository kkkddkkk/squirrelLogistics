<p align="center">
  <img src="./assets/squirrelLogistics_title.png" alt="다람쥑스프레스 타이틀" width="500"/>
</p>
<p align="center">
  <img src="./assets/squirrelLogistics_logo.gif" alt="다람쥑스프레스 로고" width="200"/>
</p>

<br>

<div align="center">

[![Notion Hub][badge-notion]][link-notion]
[![Web][badge-vercel]][link-web] [![API][badge-render]][link-api]
[![Demo Video][badge-youtube]][link-youtube]

</div>

---

## 🐿️ 프로젝트 소개

<br>

> **다람쥑스프레스**는 화주(회사)와 기사(드라이버)가 **하나의 플랫폼**에서<br/>
> 배차 · 추적 · 정산을 **실시간**으로 처리하는 양방향 물류 서비스입니다.

<br>

**핵심 차별점**
- 로그인 직후, 진행 중 운송의 **실시간 위치/상태 추적** 진입
- **예상가 ↔ 실제 운행 데이터**를 분리한 **2단계 정산**(명세서/영수증 제공)
- **최대 3개 경유지** 기반 경로 최적화(거리·무게·차종 반영)
- **다크 모드** 지원(장시간 사용 피로 최소화)

---
## 🐿️아키텍처 및 기술 스택

<div align="center">
<table>
  <thead>
    <tr>
      <th>Frontend</th>
      <th>Backend</th>
      <th>Database / Infra</th>
      <th>External APIs</th>
      <th>Collaboration & Ops</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
          
![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-593D88?logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white)
      </td>
      <td align="center">
![Java](https://img.shields.io/badge/Java-21-E76F00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![Hibernate/JPA](https://img.shields.io/badge/Hibernate%2FJPA-ORM-59666C?logo=hibernate&logoColor=white)
![Lombok](https://img.shields.io/badge/Lombok-Annotation-C3002F?logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2LjQ1IDQuNjNsLTEuMDctMS4wN2E0IDQgMCAwIDAtNS42NiAwbC04LjM5IDguMzlhMiAyIDAgMCAwLS41OCAxLjQxVjE5YTIgMiAwIDAgMCAyIDJoNi42MWEyIDIgMCAwIDAgMS40MS0uNThsOC4zOS04LjM5YTQgNCAwIDAgMC0uMDEtNS42NnoiLz48L3N2Zz4=&logoColor=white)
![WebSocket/STOMP](https://img.shields.io/badge/WebSocket-Realtime-00897B?logo=socket.io&logoColor=white)
      </td>
      <td align="center">
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Aiven](https://img.shields.io/badge/Aiven-Managed%20DB-FF6A00?logo=aiven&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Server-8A05FF?logo=render&logoColor=white)
      </td>
      <td align="center">
![Kakao Map/Route](https://img.shields.io/badge/Kakao-Map%20%2F%20Navi-C8A600?logo=kakaotalk&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white)
![Kakao OAuth](https://img.shields.io/badge/Kakao-OAuth-7A5B00?logo=kakaotalk&logoColor=white)
![PortOne](https://img.shields.io/badge/PortOne-Payment-1A1A1A?logo=passport&logoColor=white)
      </td>
      <td align="center">
![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?logo=github&logoColor=white)
![SourceTree](https://img.shields.io/badge/SourceTree-Git-2F7BF6?logo=atlassian&logoColor=white)
![Jira](https://img.shields.io/badge/Jira-Project-0052CC?logo=jira&logoColor=white)
![Confluence](https://img.shields.io/badge/Confluence-Docs-172B4D?logo=confluence&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-Hub-222222?logo=notion&logoColor=white)
      </td>
    </tr>
  </tbody>
</table>
</div>

---

## 🐿️ 데이터 모델(ERD)
<div align="center">
  <img src="./assets/data_model.png" alt="ERD" width="100%"/>
</div>

- **User / Company / Driver**: 사용자·회사·기사 기초 정보 및 권한
- **DeliveryRequest(운송요청)**: 출발/도착·경유지·화물/차종·요금 파라미터
- **DeliveryAssignment(배차)**: 요청당 활성 1건, 기사 선택/배정 상태
- **ActualDelivery(실제운송)**: 실시간 이동/상태 로그·경유지 통과 기록
- **TrackingLog / StatusLog**: 위치 좌표·상태 전이 기록
- **Payment(1차/2차) & Receipt**: 예상/실제 경로 반영, 영수증 증빙
- **Review / Report / Evidence**: 리뷰·신고/증빙(사진 등)
- **Vehicle / VehicleType**: 기사 차량 및 차종 메타
- **Policy / Banner / Notice**: 관리자 정책·배너·공지 운영

---

## 🐿️ 주요 기능
> 각 기능은 접기(Details) 블록으로 구성되어 클릭으로 펼쳐볼 수 있습니다.

<details>
  <summary><b>1) 회원가입/로그인 (로컬 & 소셜)</b></summary>

<br>

- 로컬(ID/PW) + Google/Kakao OAuth
- 비밀번호 재설정/본인인증 플로우
  
<p align="center">
  <img src="./assets/signin.png" alt="Auth_1" width="49%"/>
  <img src="./assets/login.png" alt="Auth_2" width="49%"/>
</p>

</details>

<details>
  <summary><b>2) 예상 견적 산출/ 기사 지명</b></summary>
    
<br>

- 출발/도착 + 최대 3개 경유지
- 화물/차량, 거리·무게 슬라이더 → 예상가 자동 산출
- 평점/필터·프로필 열람 → 지명 요청

 <p align="center">
  <img src="./assets/estimate.png" alt="Estimate_1" width="49%"/>
  <img src="./assets/driverpick.png" alt="Estimate_1" width="49%"/>
 </p>

</details>


<details>
  <summary><b>4) 결제(1차) & 영수증</b></summary>

<br>

- PortOne 결제 연동, 약관/수단 선택
- 거래 명세서 및 영수증 출력
  
<p align="center">
  <img src="./assets/pay1.png" alt="Payment_1" width="49%"/>
  <img src="./assets/receipt.png" alt="Payment_2" width="49%"/>
</p>

</details>

<details>
  <summary><b>5) 운송 실시간 추적</b></summary>

<br>

- WebSocket/STOMP 기반 위치/상태 실시간 반영
- 지도 경로 시각화, 버튼 입력을 통한 운송 상태 변화 (픽업/도착/하차)
- 이동 경로 기록 및 이탈 여부 확인을 위한 더미 운전자 모델
  
<p align="center">
  <img src="./assets/tracking.gif" alt="Ongoing_1" width="49%"/>
  <img src="./assets/ongoing.png" alt="Ongoing_2" width="49%"/>
</p>

</details>

<details>
  <summary><b> 6) 실계산(2차 정산)</b></summary>

<br>

- 실제 주행 거리/ 경로 출력
- 길제 이동 경로 기반 최종 금액 산출
  
<p align="center">
  <img src="./assets/actualmap.png" alt="Settlement_1" width="49%"/>
  <img src="./assets/settlement.png" alt="Settlement_2" width="49%"/>
</p>

</details>

<details>
  <summary><b>7) 이용기록/리뷰</b></summary>

<br>

- 완료된 운송에 대한 리뷰 및 신고 작성/수정
- 전체 완료 운송 내역 확인
  
<p align="center">
  <img src="./assets/review.png" alt="Review" width="49%"/>
  <img src="./assets/history.png" alt="History" width="49%"/>
</p>

</details>

<details>
  <summary><b>8) 관리자 기능(회원/신고/정산 관리)</b></summary>

<br>

- 회원/ 차종 관리
- 신고 대시보드 및 신고 관리
- 정산 대시보드 및 미정산 결제건 관리
  
<p align="center">
  <img src="./assets/user.png" alt="Admin_1" width="33%"/>
  <img src="./assets/report.png" alt="Admin_2" width="33%"/>
  <img src="./assets/unsettled.png" alt="Admin_3" width="33%"/>
</p>

</details>

---

## 🐿️ 역할 및 담당 기능

<p align="center">
  <table>
    <colgroup>
    <col width="140" /> 
    <col width="360" />
    <col width="500" />
    </colgroup>
    <tr>
      <th>이름</th>
      <th>담당 영역</th>
      <th>핵심 기여</th>
    </tr>
    <tr>
      <td nowrap><nobr>이준원</nobr></td>
      <td>메인, 로그인, 공통 Header/Footer, 관리자단 회원/차량/정책 관리</td>
      <td>통합 네비게이션/레이아웃 설계, 인증 플로우 구현, 관리자 정책 관리 UI/CRUD</td>
    </tr>
    <tr>
       <td nowrap><nobr>김도경</nobr></td>
      <td>결제/실계산, 이용기록, 리뷰, 신고/문의, 관리자단 신고/배너 관리</td>
      <td>PortOne 결제·영수증, 1차/2차 정산 로직, 기록/리뷰/신고 도메인 + 관리자 배너 운영</td>
    </tr>
    <tr>
      <td nowrap><nobr>정윤진</nobr></td>
      <td>예상 금액 산정, 기사 요청/배송 조회, 회사 정보</td>
      <td>거리·무게 기반 요금 산정, 기사 검색/지명, 회사 정보 화면 및 상태관리</td>
    </tr>
    <tr>
      <td nowrap><nobr>고은설</nobr></td>
      <td>실시간 위치 추적, 요청 목록, 캘린더(이용기록/기사 일정), 관리자단 공지/정산 관리</td>
      <td>WebSocket 실시간 트래킹, 요청 리스트/필터, 일정 캘린더, 관리자 공지·정산 대시보드</td>
    </tr>
    <tr>
      <td nowrap><nobr>임수현</nobr></td>
      <td>차량 정보, 운송 내역, 기사 정보, 신고/문의</td>
      <td>차량 등록/상태 관리, 운송 기록·상세, 기사 프로필, 문의/신고 UX</td>
    </tr>
  </table>
</p>

---

## 🐿️ 문서 & 링크 모음

- 🗒️ 회의록 모음: [바로가기][link-meetings]
- 🧩 와이어프레임 모음: [바로가기][link-wireframes]
- 🐙 GitHub 브랜치 & Jira 태스크 스크린샷: [바로가기][link-process]
- 🖼️ 프로젝트 설명 슬라이드(PDF): [열기][link-slides]


[badge-notion]: https://img.shields.io/badge/Notion-Hub-222222?logo=notion&logoColor=white
[badge-vercel]: https://img.shields.io/badge/Web-Vercel-000000?logo=vercel&logoColor=white
[badge-render]: https://img.shields.io/badge/API-Render-8A05FF?logo=render&logoColor=white
[badge-youtube]: https://img.shields.io/badge/Demo-YouTube-FF0000?logo=youtube&logoColor=white

[link-web]: https://web.example.com
[link-api]: https://api.example.com
[link-notion]: https://www.notion.so/Squirrel-Logistics-238ee5b3591b80e5ad2ace4a11b3d48a
[link-live]: https://example.com     
[link-youtube]: https://youtu.be/xxxx  

[link-meetings]: https://www.notion.so/.../meetings        
[link-wireframes]: https://www.notion.so/.../wireframes     
[link-process]: https://www.notion.so/.../process           
[link-slides]: ./assets/slides.pdf                         
