import EstimateForm_new from "../../components/estimate/EstimateForm_new";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

const EstimatePage_new = () => {
  return (
    <>
      <Header />
      <div className="page-wrap">
        <EstimateForm_new />
      </div>
      <Footer />
    </>
  );
};

export default EstimatePage_new;
