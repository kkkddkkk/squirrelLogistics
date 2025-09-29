import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { CommonTitle } from "../../components/common/CommonText";
import BannerList from "../../components/admin/Banner/BannerList";
import CommonList from "../../components/common/CommonList";
import BannerThumbnail from "../../components/admin/Banner/BannerThumbnail";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { deleteBanner, getBannerList } from "../../api/admin/bannerApi";
import { useLocation, useNavigate } from "react-router-dom";

const BannerPage = () => {

    const thisTheme = useTheme();
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { moveToMain } = usePaymentMove();

    const [refreshKey, setRefreshKey] = useState(0);
    const [bannerList, setBannerList] = useState([]);
    const [bannerForm, setBannerForm] = useState([]);


    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        const fetchData = async () => {
            try {
                const res = await getBannerList({ accessToken });
                setBannerList(res.data);
                console.log(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [refreshKey])

    const NumberBox = ({ index }) => {
        return (
            <CommonList padding={2} sx={{
                display: "flex",
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: "column",
                boxSizing: "border-box",
                height: "calc(100% - 16px)",
            }}>
                {index}
            </CommonList>
        )
    }

    const addBanner = () => {
        navigate({ pathname: `/admin/banner/add` });
    }

    const handleDeleteBanner = (bannerId) => {
        console.log(bannerId);
        if (!window.confirm("배너를 삭제하시겠습니까? 삭제된 배너는 복구되지 않습니다.")) return;
        const accessToken = localStorage.getItem("accessToken");
        deleteBanner({ accessToken, bannerId })
            .then(
                console.log('삭제성공')
            );
        console.log('deleted');
    }
    const showBanner = (record) => {
        navigate({ pathname: `/admin/banner/add`, search: `?id=${record.bannerId}` });
    }
    const showThumbnail = (record) => {
        setBannerForm(record);
    }

    return (
        <>
            <CommonTitle>배너 관리</CommonTitle>
            <Grid container spacing={3} marginBottom={10} padding={isMobile ? "5%" : ""}>
                {isMobile ? <></> : <Grid size={3} />}
                <Grid size={isMobile ? 12 : 6}>
                    <BannerThumbnail bannerLength={bannerList?.length}
                        src={bannerForm.imageUrl} mobile={isMobile}
                        bannerForm={bannerForm} adding={false} />
                    {bannerList?.length > 0 ?
                        bannerList?.map((record, index) => (
                            <Grid container spacing={1} onClick={() => showThumbnail(record)}>
                                <Grid size={isMobile ? 2 : 1} >
                                    <NumberBox index={index + 1} />
                                </Grid>
                                <Grid size={isMobile ? 10 : 11}>
                                    <BannerList
                                        key={record.id}
                                        title={record.title}
                                        deleteFunc={() => handleDeleteBanner(record.bannerId)}
                                        showFunc={() => showBanner(record)}
                                        isBanner={true}
                                        showThumbnail={showThumbnail}
                                        mobile={isMobile}
                                    />
                                </Grid>
                            </Grid>
                        )) : <></>}

                    {bannerList.length < 3 ?
                        <Grid container spacing={1}>
                            <Grid size={isMobile ? 2 : 1} >
                                <NumberBox index={<PostAddIcon sx={{ color: thisTheme.palette.text.secondary }} />} />
                            </Grid>
                            <Grid size={isMobile ? 10 : 11}>
                                <BannerList
                                    addFunc={addBanner}
                                    isBanner={false}
                                    mobile={isMobile}
                                />
                            </Grid>
                        </Grid>
                        : <></>
                    }

                </Grid>
                {isMobile ? <></> : <Grid size={3} />}
            </Grid>
        </>
    )
}
export default BannerPage;