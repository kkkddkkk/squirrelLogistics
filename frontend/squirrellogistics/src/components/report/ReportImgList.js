import { useRef } from "react";
import { Grid } from "@mui/material";
import { AddedImg, AddImgInput } from "../common/CommonForCompany";


const ReportImgList = ({ preview, setPreview }) => {
    const fileRef = useRef(null);

    const handleClickAddImg = () => {//file input 강제 클릭
        fileRef.current.click();
    }

    const handleImgChange = (e) => {//사진 입력
        const files = Array.from(e.target.files); // 여러 개 선택 가능하게
        if (files.length === 0) return;

        // File 객체 자체를 상태에 저장
        setPreview(prevFiles => [...prevFiles, ...files]);
    };

    const handleImgRemove = (e, idx) => {
        e.stopPropagation();//이벤트 상위 전파 방지
        // eslint-disable-next-line no-restricted-globals
        if (confirm('사진을 삭제하시겠습니까?')) {//선택한 사진만 삭제
            setPreview((prev) => prev.filter((_, i) => i !== idx));
        }
    }



    return (
        <Grid container spacing={1} display={"flex"} marginBottom={"5%"}>
            {Array.isArray(preview) && preview.map((img, idx) => (
                <Grid key={idx} size={2.4}>
                    <AddedImg preview={img} idx={idx} func={handleImgRemove}/>
                </Grid>
            ))}
            {preview.length < 5 ?
                <Grid size={2.4}>
                    <AddImgInput fileRef={fileRef} funcAdd={handleClickAddImg} funcChange={handleImgChange}
                        preview={preview}
                    />
                </Grid> : <></>
            }
        </Grid>
    )
}
export default ReportImgList;