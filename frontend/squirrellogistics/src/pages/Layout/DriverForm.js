import { useEffect, useRef, useState, useMemo } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/user/api";
import TermsConsent from "../../components/term/TermsConsent";
import PreferredAreasSelect from "../../components/Area/PreferredAreasSelect";
import dayjs from "dayjs";
import PreferredTimeBlock from "../../components/Time/PreferredTimeBlock";

const helperProps = { sx: { minHeight: "20px" } }; // helperText 높이 고정
const DEFAULT_VEHICLES = [
    { id: 1, name: "1톤 트럭" },
    { id: 2, name: "2.5톤 트럭" },
];

export default function DriverForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        loginId: "",
        email: "",
        phone: "",
        birthday: "",
        password: "",
        password2: "",
        account: "",
        businessN: "",
        vehicleTypeId: "",
        carNum: "",
        licenseNum: "",
        licenseDT: "",
        timeWindow: "07:00AM ~ 18:00PM",
        preferredAreas: [],
        mainLoca: "서울",
        agreeTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // 중복확인 상태
    const [idStatus, setIdStatus] = useState("idle");     // idle | checking | ok | dup
    const [emailStatus, setEmailStatus] = useState("idle");

    const [startTime, setStartTime] = useState(dayjs().hour(7).minute(0));   // 기본 07:00
    const [endTime, setEndTime] = useState(dayjs().hour(18).minute(0));      // 기본 18:00

    // refs (첫 에러 스크롤/포커스)
    const refs = {
        name: useRef(null),
        loginId: useRef(null),
        email: useRef(null),
        phone: useRef(null),
        birthday: useRef(null),
        password: useRef(null),
        password2: useRef(null),
        account: useRef(null),
        businessN: useRef(null),
        vehicleTypeId: useRef(null),
        carNum: useRef(null),
        licenseNum: useRef(null),
        licenseDT: useRef(null),
        timeWindow: useRef(null),
        mainLoca: useRef(null),
        agreeTerms: useRef(null),
    };

    const onChange = (key) => (e) => {
        const v = e.target.value;
        setForm((p) => ({ ...p, [key]: v }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
        if (key === "loginId") setIdStatus("idle");
        if (key === "email") setEmailStatus("idle");
    };

    // 전화번호 자동 하이픈
    const onPhoneChange = (e) => {
        let v = e.target.value.replace(/[^0-9]/g, "");
        if (v.startsWith("02")) {
            if (v.length > 2 && v.length <= 5) v = v.replace(/(\d{2})(\d{1,3})/, "$1-$2");
            else if (v.length > 5) v = v.replace(/(\d{2})(\d{3,4})(\d{0,4}).*/, "$1-$2-$3");
        } else {
            if (v.length > 3 && v.length <= 7) v = v.replace(/(\d{3})(\d{1,4})/, "$1-$2");
            else if (v.length > 7) v = v.replace(/(\d{3})(\d{3,4})(\d{0,4}).*/, "$1-$2-$3");
        }
        setForm((p) => ({ ...p, phone: v }));
        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
    };

    // ✅ 차종 불러오기: /api/vehicles/types → 실패/빈배열이면 /api/vehicle-types → 그래도 실패면 기본값
    const [terms, setTerms] = useState([]);                  // /api/public/register-meta 로 받아온 약관
    const [agreedTerms, setAgreedTerms] = useState(new Set()); // 동의한 term id 집합
    const [vehicleTypes, setVehicleTypes] = useState(DEFAULT_VEHICLES);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/api/public/register-meta");
                // 차종
                const vts = (data?.vehicleTypes || []).map(v => ({ id: v.id, name: v.name }));
                setVehicleTypes(vts.length ? vts : DEFAULT_VEHICLES);
                // 약관
                setTerms(Array.isArray(data?.terms) ? data.terms : []);
            } catch {
                // 실패 시에도 안전하게 동작
                setVehicleTypes(DEFAULT_VEHICLES);
                setTerms([]); // 비우면 기본 문구 표시
            }
        })();
    }, []);

    // 중복확인
    const checkLoginId = async () => {
        if (!form.loginId?.trim()) {
            setErrors((e) => ({ ...e, loginId: "아이디를 입력해주세요." }));
            focusFirstError({ loginId: "아이디를 입력해주세요." });
            return;
        }
        setIdStatus("checking");
        try {
            const { data } = await api.get("/api/auth/exists/loginId", { params: { loginId: form.loginId } });
            setIdStatus(data.exists ? "dup" : "ok");
            setErrors((e) => ({ ...e, loginId: data.exists ? "이미 사용 중인 아이디입니다." : "" }));
        } catch {
            setIdStatus("idle");
            alert("아이디 중복확인 중 오류가 발생했습니다.");
        }
    };

    const checkEmail = async () => {
        const emailRe = /^\S+@\S+\.\S+$/;
        if (!emailRe.test(form.email || "")) {
            setErrors((e) => ({ ...e, email: "이메일 형식이 올바르지 않습니다." }));
            focusFirstError({ email: "이메일 형식이 올바르지 않습니다." });
            return;
        }
        setEmailStatus("checking");
        try {
            const { data } = await api.get("/api/auth/exists/email", { params: { email: form.email } });
            setEmailStatus(data.exists ? "dup" : "ok");
            setErrors((e) => ({ ...e, email: data.exists ? "이미 사용 중인 이메일입니다." : "" }));
        } catch {
            setEmailStatus("idle");
            alert("이메일 중복확인 중 오류가 발생했습니다.");
        }
    };

    // 검증
    const validate = () => {
        const next = {};
        const emailRe = /^\S+@\S+\.\S+$/;
        const phoneRe = /^(01[016789]-\d{3,4}-\d{4}|02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/;

        if (!form.name?.trim()) next.name = "이름을 입력해주세요.";
        if (!form.loginId?.trim()) next.loginId = "아이디를 입력해주세요.";
        if (!form.email?.trim()) next.email = "이메일을 입력해주세요.";
        else if (!emailRe.test(form.email)) next.email = "이메일 형식이 올바르지 않습니다.";
        if (!form.phone?.trim()) next.phone = "연락처를 입력해주세요.";
        else if (!phoneRe.test(form.phone)) next.phone = "전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678";
        if (!startTime) next.timeWindow = "시작 시간을 선택해주세요.";
        if (!endTime) next.timeWindow = "종료 시간을 선택해주세요.";
        if (!form.birthday) next.birthday = "생년월일을 선택해주세요.";
        if (!form.password) next.password = "비밀번호를 입력해주세요.";
        if (!form.password2) next.password2 = "비밀번호 확인을 입력해주세요.";
        if (form.password && form.password2 && form.password !== form.password2)
            next.password2 = "비밀번호가 일치하지 않습니다.";

        if (!form.vehicleTypeId) next.vehicleTypeId = "차종을 선택해주세요.";
        if (!form.licenseNum?.trim()) next.licenseNum = "운전면허증 번호를 입력해주세요.";
        if (!form.licenseDT) next.licenseDT = "면허 유효기간을 선택해주세요.";
        //if (!form.mainLoca?.trim()) next.mainLoca = "운행 선호 지역을 선택해주세요.";
        if (!form.preferredAreas || form.preferredAreas.length === 0) {
            next.mainLoca = "최소 1개 이상의 선호지역을 선택해주세요.";
        }
        // ✅ 필수 약관 강제
        const requiredIds = terms.filter(t => t.isRequired).map(t => t.id);
        const agreedSet = agreedTerms instanceof Set ? agreedTerms : new Set(agreedTerms);
        if (requiredIds.length > 0 && !requiredIds.every(id => agreedSet.has(id))) {
            // 약관 블록에 에러 표시를 위해 키 추가(예: agreeTerms)
            next.agreeTerms = "필수 약관에 동의해야 합니다.";
        }

        // 중복확인 완료 강제
        if (idStatus !== "ok") next.loginId = next.loginId || "아이디 중복확인을 완료해주세요.";
        if (emailStatus !== "ok") next.email = next.email || "이메일 중복확인을 완료해주세요.";

        return next;
    };

    // 첫 에러로 스크롤 & 포커스
    const focusFirstError = (errs) => {
        const firstKey = Object.keys(errs)[0];
        if (!firstKey) return;
        const holder = refs[firstKey]?.current;
        const input = holder?.querySelector?.("input, textarea, [role='checkbox'], button") || holder;
        holder?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input?.focus?.(), 60);
    };

    // 제출
    const onSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (Object.keys(v).length) {
            setErrors(v);
            focusFirstError(v);
            return;
        }

        const payload = {
            loginId: form.loginId,
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            birthday: form.birthday,
            account: form.account,
            businessN: form.businessN,
            mainLoca: form.preferredAreas.join(","),
            licenseNum: form.licenseNum,
            licenseDT: form.licenseDT,
            drivable: true,
            vehicleTypeId: Number(form.vehicleTypeId),
            carNum: form.carNum || null,
            agreeTerms: form.agreeTerms,
        };

        try {
            setLoading(true);
            await api.post("/api/auth/register/driver", payload);
            alert("기사 회원가입이 완료되었습니다.");
            navigate("/");
        } catch (err) {
            console.error(err);
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "회원가입 중 오류가 발생했습니다.";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const vehicleOptions = useMemo(
        () => vehicleTypes.map((v) => ({ id: v.id, name: v.name })),
        [vehicleTypes]
    );

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">기본 정보</Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <div ref={refs.name} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="이름"
                        fullWidth
                        value={form.name}
                        onChange={onChange("name")}
                        error={!!errors.name}
                        helperText={errors.name || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                {/* 아이디 + 중복확인 */}
                <div ref={refs.loginId} style={{ flex: "1 1 48%" }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <TextField
                            label="아이디"
                            fullWidth
                            value={form.loginId}
                            onChange={onChange("loginId")}
                            error={!!errors.loginId || idStatus === "dup"}
                            helperText={
                                errors.loginId ||
                                (idStatus === "ok" ? "사용 가능한 아이디입니다." :
                                    idStatus === "dup" ? "이미 사용 중입니다." : " ")
                            }
                            FormHelperTextProps={helperProps}
                        />
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={checkLoginId}
                            sx={{ minWidth: 110, whiteSpace: "nowrap", height: "56px" }}
                            disabled={!form.loginId || idStatus === "checking"}
                        >
                            {idStatus === "checking" ? "확인중..." : "중복 확인"}
                        </Button>
                    </Box>
                </div>

                {/* 이메일 + 중복확인 */}
                <div ref={refs.email} style={{ flex: "1 1 48%" }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <TextField
                            label="이메일"
                            fullWidth
                            value={form.email}
                            onChange={onChange("email")}
                            error={!!errors.email || emailStatus === "dup"}
                            helperText={
                                errors.email ||
                                (emailStatus === "ok" ? "사용 가능한 이메일입니다." :
                                    emailStatus === "dup" ? "이미 사용 중입니다." : " ")
                            }
                            FormHelperTextProps={helperProps}
                        />
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={checkEmail}
                            sx={{ minWidth: 110, whiteSpace: "nowrap", height: "56px" }}
                            disabled={!form.email || emailStatus === "checking"}
                        >
                            {emailStatus === "checking" ? "확인중..." : "중복 확인"}
                        </Button>
                    </Box>
                </div>

                <div ref={refs.phone} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="연락처"
                        fullWidth
                        value={form.phone}
                        onChange={onPhoneChange}
                        error={!!errors.phone}
                        helperText={errors.phone || " "}
                        FormHelperTextProps={helperProps}
                        placeholder="010-1234-5678"
                    />
                </div>

                <div ref={refs.birthday} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="생년월일"
                        type="date"
                        fullWidth
                        value={form.birthday}
                        onChange={onChange("birthday")}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.birthday}
                        helperText={errors.birthday || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.password} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="비밀번호"
                        type="password"
                        fullWidth
                        value={form.password}
                        onChange={onChange("password")}
                        error={!!errors.password}
                        helperText={errors.password || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.password2} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="비밀번호 확인"
                        type="password"
                        fullWidth
                        value={form.password2}
                        onChange={onChange("password2")}
                        error={!!errors.password2}
                        helperText={errors.password2 || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.account} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="계좌번호"
                        fullWidth
                        value={form.account}
                        onChange={onChange("account")}
                        helperText={" "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.businessN} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="사업자 등록번호"
                        fullWidth
                        value={form.businessN}
                        onChange={onChange("businessN")}
                        error={!!errors.businessN}
                        helperText={errors.businessN || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                {/* 차량 등록 */}
                <Typography variant="h6" sx={{ mt: 3, flex: "1 1 100%" }}>
                    차량 등록
                </Typography>

                <div ref={refs.vehicleTypeId} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="차종"
                        select
                        fullWidth
                        value={form.vehicleTypeId}
                        onChange={onChange("vehicleTypeId")}
                        error={!!errors.vehicleTypeId}
                        helperText={errors.vehicleTypeId || " "}
                        FormHelperTextProps={helperProps}
                    >
                        {vehicleOptions.map((v) => (
                            <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                        ))}
                    </TextField>
                </div>

                <div ref={refs.carNum} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="차량 번호"
                        fullWidth
                        value={form.carNum}
                        onChange={onChange("carNum")}
                        helperText={" "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.licenseNum} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="운전면허증 번호"
                        fullWidth
                        value={form.licenseNum}
                        onChange={onChange("licenseNum")}
                        error={!!errors.licenseNum}
                        helperText={errors.licenseNum || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <div ref={refs.licenseDT} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="운전면허 유효기간"
                        type="date"
                        fullWidth
                        value={form.licenseDT}
                        onChange={onChange("licenseDT")}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.licenseDT}
                        helperText={errors.licenseDT || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                <Button variant="outlined" type="button" onClick={() => alert("진위확인 연동 예정")} sx={{ height: 56 }}>
                    운전면허 진위확인
                </Button>

                <div ref={refs.timeWindow} style={{ flex: "1 1 100%" }}>
                    <PreferredTimeBlock
                        start={startTime}
                        end={endTime}
                        onChange={({ start, end }) => {
                            if (errors.timeWindow) setErrors((p) => ({ ...p, timeWindow: "" }));
                            setStartTime(start);
                            setEndTime(end);
                        }}
                        error={!!errors.timeWindow}
                        helperText={errors.timeWindow}
                        minuteStep={15}
                    />
                </div>

                <div ref={refs.mainLoca} style={{ flex: "1 1 100%" }}>
                    <PreferredAreasSelect
                        value={form.preferredAreas}
                        onChange={(vals) => {
                            setForm((p) => ({ ...p, preferredAreas: vals }));
                            if (errors.mainLoca) setErrors((prev) => ({ ...prev, mainLoca: "" }));
                        }}
                        label="운행 선호 지역 (복수 선택)"
                        error={!!errors.mainLoca}
                        helperText={errors.mainLoca}
                    // maxSelections={5}   // 선택 최대 개수를 제한하고 싶으면 주석 해제
                    />
                </div>
            </Box>

            {/* 약관 */}
            <Box sx={{ border: "1px solid #ccc", p: 2, maxHeight: 240, overflowY: "auto" }}>
                <TermsConsent terms={terms} agreed={agreedTerms} onChange={setAgreedTerms} />
            </Box>

            <div ref={refs.agreeTerms}>
                {errors.agreeTerms && (
                    <FormHelperText error sx={{ ml: 1 }}>
                        {errors.agreeTerms}
                    </FormHelperText>
                )}
            </div>

            <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                    variant="contained"
                    type="submit"
                    disabled={
                        loading ||
                        idStatus === "checking" || emailStatus === "checking" ||
                        idStatus === "dup" || emailStatus === "dup" ||
                        // ✅ 필수 약관 미동의 시 버튼 비활성
                        terms.some(t => t.isRequired) &&
                        !terms.filter(t => t.isRequired).every(t => agreedTerms.has(t.id))
                    }
                >
                    {loading ? "처리 중..." : "회원가입"}
                </Button>
                <Button variant="outlined" type="button" onClick={() => navigate(-1)}>
                    취소
                </Button>
            </Box>
        </Box>
    );
}
