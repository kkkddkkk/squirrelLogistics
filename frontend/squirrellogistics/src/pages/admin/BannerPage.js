import { Grid, useTheme } from "@mui/material";
import { CommonTitle } from "../../components/common/CommonText";
import BannerList from "../../components/admin/Banner/BannerList";
import CommonList from "../../components/common/CommonList";
import BannerThumbnail from "../../components/admin/Banner/BannerThumbnail";
import { ButtonContainer, Two100Buttons } from "../../components/common/CommonButton";
import ReactDragList from 'react-drag-list';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { getBannerList } from "../../api/admin/bannerApi";
import { useNavigate } from "react-router-dom";

const BannerPage = () => {

    const thisTheme = useTheme();
    const navigate = useNavigate();
    const { moveToMain } = usePaymentMove();

    const [refreshKey, setRefreshKey] = useState(0);
    const [bannerList, setBannerList] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();

        getBannerList({ accessToken })
            .then(res => {
                setBannerList(res.data);
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [])

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

    const deleteBanner = () => {
        if (!window.confirm("배너를 삭제하시겠습니까? 삭제된 배너는 복구되지 않습니다.")) return;
        console.log('deleted');
    }
    const showBanner = () => {

    }
    const returnBanner = () => {

    }
    const saveBanner = () => {

    }
    const showThumbnail = () => {
        console.log('clicked');
    }

    return (
        <>
            <CommonTitle>배너 관리</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={3} />
                <Grid size={6}>
                    <BannerThumbnail bannerLength={bannerList?.length} />
                    {bannerList?.length > 0 ?
                        <ReactDragList
                            key={refreshKey}
                            dataSource={bannerList}
                            row={(record, index) => (
                                <Grid container spacing={1} onClick={showThumbnail}>
                                    <Grid size={1} >
                                        <NumberBox index={index + 1} />
                                    </Grid>
                                    <Grid size={11}>
                                        <BannerList
                                            key={record.id}
                                            title={record.title}
                                            deleteFunc={deleteBanner}
                                            showFunc={showBanner}
                                            isBanner={true}
                                            showThumbnail={showThumbnail}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                            handles={false}
                            onUpdate={() => {
                                setRefreshKey(prev => prev + 1);
                            }}
                        />
                        : <></>}

                    {bannerList.length < 3 ?
                        <BannerList
                            isBanner={false}
                            addFunc={addBanner}
                        />
                        : <></>
                    }

                    {bannerList?.length > 1 ?
                        <ButtonContainer marginTop={5} marginBottom={5}>
                            <Two100Buttons
                                leftTitle={"되 돌 리 기"}
                                leftClickEvent={returnBanner}
                                rightTitle={"순 서 저 장"}
                                rightClickEvent={saveBanner}
                                gap={5}
                            />
                        </ButtonContainer> : <></>
                    }

                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    )
}
export default BannerPage;