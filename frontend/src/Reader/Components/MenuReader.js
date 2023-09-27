import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiContext } from "../..";
import { toast } from 'react-toastify';
import "../Styles/MenuReader.css";
import { GetProfile } from '../../GetProfile';
import searchIcon from '../icon/search-13-32.png';
import * as Icon1 from 'react-icons/fa';
import * as Icon2 from 'react-icons/tb';
import * as Icon3 from 'react-icons/bs';
import * as Icon4 from 'react-icons/rx';
import * as Icon5 from 'react-icons/io';
//import axios from "axios";

export default function Menubar() {

    const backend = useContext(apiContext);

    const navigate = useNavigate();

    const ReloadOk = useRef(true);
    const ReloadError = useRef(true);
    const [LoginStatus, SetLoginStatus] = useState(false);
    const [name, SetName] = useState('');
    const [username, SetUsername] = useState('');
    const [imageURL, SetImageURL] = useState('');
    const [isToggled, setIsToggled] = useState(false);
    const [NavOpen, setNavOpen] = useState(false);
    const [NavTopOpen, setNavTopOpen] = useState();

    const status = sessionStorage.getItem("UserStatus");
    const localStatus = localStorage.getItem("status");

    const rawData = GetProfile();
    const result = Promise.resolve(rawData);
    result.then(value => {
        if (value.status === 'ok' && status !== 'not login' && status !== 'publisher' && status !== 'admin' && ReloadOk.current) {
            console.log('Set reader')
            ReloadOk.current = false;
            sessionStorage.setItem("UserStatus", "reader");
            SetUsername(value.username);
            SetName(value.real_name);
            SetImageURL(value.url);
        } else if (value.status === 'tokenFail' && ReloadError.current) {
            ReloadError.current = false;
            localStorage.setItem('token', '');
            sessionStorage.setItem("LockNavInReader", "lock");
            sessionStorage.setItem("UserStatus", "not login");
            SetLoginStatus(false);
            setNavOpen(false);
        } else if (value.status === 'error' && ReloadError.current){
            ReloadError.current = false;
            console.error('Can not get infomation from getProfile');
        }
    }).catch(err => {
        console.log(err);
    });

    useEffect(() => {

        //Check if local 'status' have value equal to 2 or not if yes redirect to admin
        if (localStatus === 'admin' && status === 'not login') {
            sessionStorage.setItem("UserStatus", "admin");
            navigate("/admin");
        } else {
            //Get value from switch mode button
            const UnLockNav = sessionStorage.getItem("LockNavInReader");

            //Check a switch mode button is on reader mode or not
            if (status === "not login") {
                setNavTopOpen(true);
                SetLoginStatus(false);
            } else if (status === "reader") {
                SetLoginStatus(true);
                setIsToggled(false);
                setNavTopOpen(true);
                if (UnLockNav === "unlock") {
                    setNavOpen(true);
                }
            } else if (status === "publisher") {
                setNavTopOpen(false);
            }

        }

    }, [backend, status, localStatus, navigate]);

    //Prevent nav left bar open it self when click to another page.
    const LockSidebar = () => {
        setNavOpen(false);
        sessionStorage.setItem("LockNavInReader", "lock");
    }

    const Logout = () => {
        // Alert box popup
        toast.success('ล็อกเอาท์ออกจากระบบแล้ว', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });

        localStorage.setItem('token', '');
        sessionStorage.setItem("UserStatus", "not login");
        ReloadOk.current = false;ReloadOk.current = true;
        ReloadError.current = true;
        setNavOpen(false);
        LockSidebar();
        SetUsername('');
        SetImageURL('');
        SetLoginStatus(false);
        navigate("/");
    }

    const OpenSidebar = () => {
        setNavOpen(true);
    }

    const ChangeToPublisher = () => {
        setIsToggled(true);
        setNavTopOpen(false);
        setNavOpen(false);
        sessionStorage.setItem("LockNavInReader", "unlock");
        sessionStorage.setItem("UserStatus", "publisher");
        navigate("/publisher");
    }

    const btnLogRegis = () => {
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.add('open');
    }

    return (
        <>
            <div className="menuReader">
                <div className={`navbar ${NavOpen ? "navbar-open" : "navbar-close"}`}>
                    <div className="nav-list">
                        <div className="close-menu">
                            <button type="button" onClick={LockSidebar}><Icon3.BsArrowLeft /></button>
                        </div>
                        <div className="profile-card">
                            <div className="profile">
                                <img src={imageURL} alt="profile" />
                            </div>
                            <div className="profile-detail">
                                <h4>ชื่อผู้ใช้งาน : {username}</h4>
                                <h4>ชื่อ : {name}</h4>
                                <h4>สถานะ : Reader</h4>
                            </div>
                            <button type="button" onClick={() => navigate("/profile")}>แก้ไขโปรไฟล์</button>
                        </div>
                        <div className="nav-menu">
                            <span><Icon2.TbBookUpload /></span>
                            <li>เปลี่ยนเป็นโหมดอัปโหลด</li>
                            <div className="switchToReader">
                                <Switch isToggled={isToggled} onToggle={ChangeToPublisher} />
                            </div>
                        </div>
                        <div className="nav-menu">
                            <span><Icon3.BsBookmarkPlusFill /></span>
                            <li>รายการหนังสือที่ติดตาม</li>
                        </div>
                        <div className="nav-menu">
                            <span><Icon3.BsBookmarkHeartFill /></span>
                            <li>รายการหนังสือที่ชอบ</li>
                        </div>
                        <div className="nav-menu">
                            <span><Icon3.BsBookmarkCheckFill /></span>
                            <li>รายการหนังสือที่ซื้อแล้ว</li>
                        </div>
                        <div className="nav-menu">
                            <span><Icon1.FaDonate /></span>
                            <li>ประวัติการสนับสนุนเงิน</li>
                        </div>
                        <div className="nav-menu">
                            <button type="button" onClick={() => navigate("/UserReport")}>
                                <span><Icon2.TbMessageReport /></span>
                                <p>ร้องเรียนหาผู้ดูแลระบบ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={Logout}>
                                <span><Icon4.RxExit /></span>
                                <p>ออกจากระบบ</p>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`top-nav-reader ${NavTopOpen ? "top-nav-reader-open" : "top-nav-reader-close"}`}>
                    <div className="Top-menubar">
                        {LoginStatus ?
                            <div className="ReaderIn">
                                <button className="button-menu" aria-controls="#" aria-expanded="false" onClick={OpenSidebar}>
                                    <svg className="hamburger" viewBox="0 0 100 100" width="60" height="50">
                                        <rect className="line top" width="80" height="10" x="10" y="30" rx="5"></rect>
                                        <rect className="line middle" width="80" height="10" x="10" y="50" rx="5"></rect>
                                        <rect className="line bottom" width="80" height="10" x="10" y="70" rx="5"></rect>
                                    </svg>
                                </button>
                                <button className="cart" type="button"><Icon3.BsCart3 /></button>
                                <button className="notification" type="button"><Icon5.IoMdNotificationsOutline /></button>
                            </div>
                            : ''}
                        {!LoginStatus ? <button className="button-in" type="button" onClick={btnLogRegis}>เข้าสู่ระบบ/สมัครสมาชิก</button> : ''}
                    </div>
                    <div className="Mid-menubar">
                        <div className="container">
                            <form className="search-bar">
                                <input type="text" id="searchmenu" placeholder="ค้นหา" />
                                <button type="submit"><img src={searchIcon} alt="serach icon" /></button>
                            </form>
                        </div>
                        <ul className="menuTxt">
                            <button type="button" onClick={() => navigate("/")}>หน้าหลัก</button>
                            <button>หมวดหมู่หนังสือ</button>
                            <button>หนังสือยอดนิยม</button>
                            <button>หนังสือขายดี</button>
                            <button>โปรโมชั่น</button>
                            <button>คอมมูนิตี้โพส</button>
                            <button>สนับสนุนเว็บไซต์</button>
                            <button>ติดต่อเรา</button>
                        </ul>
                        <div className="burger">
                            <div className="line1"></div>
                            <div className="line2"></div>
                            <div className="line3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const Switch = ({ isToggled, onToggle }) => {

    return (
        <label className="switch">
            <input type="checkbox" id="switchpage" checked={isToggled} onChange={onToggle} />
            <span className="slider" />
        </label>
    );
}


