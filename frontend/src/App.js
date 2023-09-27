import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import {Routes,Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css"
import MenuReader from "./Reader/Components/MenuReader";
import Reader from "./Reader/Components/Reader";
import EditProfile from "./Reader/Components/EditProfile";
import BookDetail from "./Reader/Components/BookDetail";
import BuyBook from "./Reader/Components/BuyBook";
import UserReport from "./Reader/Components/UserReport";
import BookContent from "./Reader/Components/BookContent";
import Publisher from "./Publisher/Components/Publisher";
import MenuPublisher from "./Publisher/Components/MenuPublisher";
import Admin from "./Admin/Components/Admin";


export default function App() {

    const navigate = useNavigate();

    const [openUserMenu,SetOpenUserMenu] = useState(true);
    
    const UserStatus = sessionStorage.getItem("UserStatus");

    useEffect(()=>{

        /*Check user status in session that it null or are in admin mode if null then set user status to not login 
          and redirect to reader page if status is in admin then close user menu*/
        if (UserStatus==='null' || UserStatus===null || UserStatus==='') {
            sessionStorage.setItem("UserStatus","not login");
            sessionStorage.setItem("LockNavInReader","lock");
            navigate("/");
        }else if(UserStatus==="admin") {
            SetOpenUserMenu(false);
        }else if(UserStatus==="not login") {
            SetOpenUserMenu(true);
        }

    },[UserStatus,navigate]);

    return(
        <>
            <ToastContainer />
            {openUserMenu ?
                <div className="user-menu">
                    <MenuPublisher />
                    <MenuReader />
                </div>
            : ''}
            <Routes>
                <Route path="/*" element={<Reader/>} />
                <Route path="/bookdetail" element={<BookDetail />} />
                <Route path="/buybook" element={<BuyBook />} />
                <Route path="/readercontent" element={<BookContent />} />
                <Route path="/profile" element={<EditProfile />} />
                <Route path="/UserReport" element={<UserReport />} />
                <Route path="/publisher/*" element={<Publisher />} /> 
                <Route path="/admin/*" element={<Admin />} />
            </Routes>
        </>     
    );
}




