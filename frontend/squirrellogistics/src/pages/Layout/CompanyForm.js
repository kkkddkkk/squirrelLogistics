import { useEffect, useRef, useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/user/api";
import TermsConsent from "../../components/term/TermsConsent";

const helperProps = { sx: { minHeight: "20px" } }; // 항상 동일한 높이 확보

export default function CompanyForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        companyName: "",
        loginId: "",
        email: "",
        phone: "",
        password: "",
        password2: "",
        address1: "",
        address2: "",
        account: "",
        businessN: "",
        agreeTerms: false,
    });

    const [terms, setTerms] = useState([]);                  // /api/public/register-meta 로 받아온 약관
    const [agreedTerms, setAgreedTerms] = useState(new Set()); // 동의한 term id 집합

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // 중복확인 상태
    const [idStatus, setIdStatus] = useState("idle");     // idle | checking | ok | dup
    const [emailStatus, setEmailStatus] = useState("idle");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/api/public/register-meta");
                setTerms(Array.isArray(data?.terms) ? data.terms : []);
                // vehicleTypes도 함께 세팅 중이라면 기존 로직 유지
            } catch {
                setTerms([]); // 실패 시 기본 안내문 표시
            }
        })();
    }, []);

    // 첫 에러 포커스용
    const refs = {
        companyName: useRef(null),
        loginId: useRef(null),
        email: useRef(null),
        phone: useRef(null),
        password: useRef(null),
        password2: useRef(null),
        address1: useRef(null),
        address2: useRef(null),
        account: useRef(null),
        businessN: useRef(null),
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

    // 카카오 주소 스크립트 로드
    useEffect(() => {
        if (document.getElementById("daum-postcode-script")) return;
        const s = document.createElement("script");
        s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        s.async = true;
        s.id = "daum-postcode-script";
        document.body.appendChild(s);
    }, []);

    const openPostcode = () => {
        if (!window.daum?.Postcode) {
            alert("주소 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        new window.daum.Postcode({
            oncomplete: (data) => {
                const addr = data.roadAddress || data.jibunAddress || "";
                setForm((p) => ({ ...p, address1: addr }));
                if (errors.address1) setErrors((prev) => ({ ...prev, address1: "" }));
                setTimeout(() => document.getElementById("address2-input")?.focus(), 0);
            },
            autoClose: true,
        }).open();
    };

    // 중복확인 API
    const checkLoginId = async () => {
        if (!form.loginId?.trim()) {
            setErrors((e) => ({ ...e, loginId: "아이디를 입력해주세요." }));
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

        if (!form.companyName?.trim()) next.companyName = "회사 이름을 입력해주세요.";
        if (!form.loginId?.trim()) next.loginId = "아이디를 입력해주세요.";
        if (!form.email?.trim()) next.email = "이메일을 입력해주세요.";
        else if (!emailRe.test(form.email)) next.email = "이메일 형식이 올바르지 않습니다.";
        if (!form.phone?.trim()) next.phone = "연락처를 입력해주세요.";
        else if (!phoneRe.test(form.phone)) next.phone = "전화번호 형식이 올바르지 않습니다. 예) 010-1234-5678";

        if (!form.password) next.password = "비밀번호를 입력해주세요.";
        if (!form.password2) next.password2 = "비밀번호 확인을 입력해주세요.";
        if (form.password && form.password2 && form.password !== form.password2)
            next.password2 = "비밀번호가 일치하지 않습니다.";

        if (!form.address1?.trim()) next.address1 = "주소를 검색 후 선택해주세요.";
        if (!form.businessN?.trim()) next.businessN = "사업자 등록번호를 입력해주세요.";
        // ✅ 필수 약관 강제
        const requiredIds = terms.filter(t => t.required).map(t => t.termId);
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

    const focusFirstError = (errs) => {
        const firstKey = Object.keys(errs)[0];
        if (!firstKey) return;
        const holder = refs[firstKey]?.current;
        const input = holder?.querySelector("input, textarea, [role='checkbox'], button");
        holder?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input?.focus?.(), 60);
    };

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
            name: form.companyName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            account: form.account,
            businessN: form.businessN,
            address: [form.address1, form.address2].filter(Boolean).join(" "),
            agreeTerms: form.agreeTerms,
        };

        try {
            setLoading(true);
            await api.post("/api/auth/register/company", payload);
            alert("회사 회원가입이 완료되었습니다.");
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

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">기본 정보</Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <div ref={refs.companyName} style={{ flex: "1 1 48%" }}>
                    <TextField
                        label="회사 이름"
                        fullWidth
                        value={form.companyName}
                        onChange={onChange("companyName")}
                        error={!!errors.companyName}
                        helperText={errors.companyName || " "}
                        FormHelperTextProps={helperProps}
                    />
                </div>

                {/* 아이디 (항상 한 줄 정렬, helper 공간 고정) */}
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

                {/* 이메일 */}
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

                {/* 주소 + 버튼 */}
                <div ref={refs.address1} style={{ flex: "1 1 100%" }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <TextField
                            label="주소"
                            fullWidth
                            value={form.address1}
                            inputProps={{ readOnly: true }}
                            error={!!errors.address1}
                            helperText={errors.address1 || " "}
                            FormHelperTextProps={helperProps}
                        />
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={openPostcode}
                            sx={{ minWidth: 100, whiteSpace: "nowrap", height: "56px" }}
                        >
                            주소 검색
                        </Button>
                    </Box>
                </div>

                <div ref={refs.address2} style={{ flex: "1 1 100%" }}>
                    <TextField
                        id="address2-input"
                        label="상세주소"
                        fullWidth
                        value={form.address2}
                        onChange={onChange("address2")}
                        helperText={" "}
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
            </Box>

            {/* 약관 영역 */}
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
                        terms.some(t => t.required) &&
                        !terms.filter(t => t.required).every(t => agreedTerms.has(t.termId))
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
