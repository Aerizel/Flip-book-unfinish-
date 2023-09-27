import React from "react";
import { Routes,Route } from "react-router-dom";
import "../Style/Admin.css";
import MenuAdmin from "./MenuAdmin";
import ManageAdmin from "./ManageAdmin";
import AddAdmin from "./AddAdmin";
import EditAdmin from "./EditAdmin";
import BookSellApprov from "./BookSellApprove";
import BookDetailApprove from "./BookDetailApprove";
import BookContent from "./BookContent";
import ReportFromUser from "./ReportFromUser";
import ReportDetail from "./ReportDetail";
import ReportAccept from "./ReportAccept";
import ReportFix from "./ReportFix";
import StatisticAdmin from "./StatisticAdmin";

export default function Admin() {

    return(
        <>
            <MenuAdmin />
            <Routes>
                <Route path="/ManageAdmin" element={<ManageAdmin />} />
                <Route path="/AddAdmin" element={<AddAdmin />} />
                <Route path="/EditAdmin" element={<EditAdmin />} />
                <Route path="/BookSellApprove" element={<BookSellApprov />} />
                <Route path="/BookDetailApprove" element={<BookDetailApprove />} />
                <Route path="/BookContent" element={<BookContent />} />
                <Route path="/ReportFromUser" element={<ReportFromUser />} />
                <Route path="/ReportDetail" element={<ReportDetail />} />
                <Route path="/ReportAccept" element={<ReportAccept />} />
                <Route path="/ReportFix" element={<ReportFix />} />
                <Route path="/StatisticAdmin" element={<StatisticAdmin />} />
            </Routes>
            <div className="admin-title">
                
            </div>
        </>
    );
}