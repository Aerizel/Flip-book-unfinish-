import React,{useEffect} from "react";
import { Routes,Route } from "react-router-dom";
import "../Styles/Publisher.css"
import UploadBook from "./UploadBook";
import ManageBook from "./ManageBook";
import EditBook from "./EditBook";
import ViewSellBook from "./ViewBookSell";
import PublisherReport from "./PublisherReport";
import StatisticPublisher from "./StatisticPublisher";

export default function Publisher() {

    const sessionCheck = sessionStorage.getItem("UserStatus");

    useEffect(()=>{
        if(sessionCheck!=="publisher") {
            sessionStorage.setItem("UserStatus","publisher");
        }
    },[sessionCheck]);

    return(
        <>
            
            <Routes>
                <Route path="/Uploadbook" element={<UploadBook/>} />
                <Route path="/Managebook" element={<ManageBook/>} />
                <Route path="/Editbook" element={<EditBook/>} />
                <Route path="/ViewBookSell" element={<ViewSellBook/>} />
                <Route path="/StatisticPublisher" element={<StatisticPublisher />} />
                <Route path="/PublisherReport" element={<PublisherReport />} />
            </Routes>
        </>
    );
}