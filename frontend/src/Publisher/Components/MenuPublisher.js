import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "../Styles/MenuPublisher.css";
import { GetProfile } from '../../GetProfile';
import * as Icon1 from 'react-icons/fa';
import * as Icon2 from 'react-icons/tb';
import * as Icon4 from 'react-icons/rx';
import * as Icon5 from 'react-icons/io';
import * as Icon6 from 'react-icons/im';

export default function Menubar() {

    const [NavOpen, setNavOpen] = useState();

    const navigate = useNavigate();

    const [isToggled, setIsToggled] = useState(false);
    const status = sessionStorage.getItem("UserStatus");

    const [username, SetUsername] = useState('');
    const [name, SetName] = useState('');
    const [imageURL, SetImageURL] = useState('');

    useEffect(() => {
        if (status === "publisher") {
            setIsToggled(true);
            setNavOpen(true);
        } else {
            setIsToggled(false);
            setNavOpen(false);
        }
    }, [status]);

    const ChangeToReader = () => {
        setIsToggled(false);
        setNavOpen(false);
        sessionStorage.setItem("UserStatus", "reader");
        navigate("/")
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

        setIsToggled(false);
        setNavOpen(false);
        localStorage.setItem('token', '');
        sessionStorage.setItem("UserStatus", "not login");
        sessionStorage.setItem("LockNavInReader","lock");
        navigate("/");
    }

    const token = localStorage.getItem("token");
    //Prevent from infinite loop error
    if(status!=='not login') {
        //Check token that is null or not
        if (token) {
            fetchData();
        } else {
            //Logout();
        }
    }

    //Call GetProfile component to get profile value then receive return value 
    async function fetchData() {
        try {
            const profileData = await GetProfile();

            if (profileData.status==='ok') {
                SetUsername(profileData.username);
                SetName(profileData.real_name);
                SetImageURL(profileData.url);
            } else {
                console.error('Can not get infomation from getProfile');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    return (
        <>
            <div className="menuPublisher">
                <div className={`navbar ${NavOpen ? "navbar-open" : "navbar-close"}`}>
                    <div className="nav-list">
                        <div className="profile-card">
                            <div className="profile">
                                <img src={imageURL} alt="profile" />
                            </div>
                            <div className="profile-detail">
                                <h4>ชื่อผู้ใช้งาน : {username}</h4>
                                <h4>ชื่อ : {name}</h4>
                                <h4>สถานะ : Publisher</h4>
                            </div>
                            <button type="button" onClick={() => navigate("/profile")}>แก้ไขโปรไฟล์</button>
                        </div>
                        <div className="nav-menu">
                            <span><Icon1.FaBookReader /></span>
                            <li>เปลี่ยนเป็นโหมดอ่านอีบุ๊ก</li>
                            <div className="switchToPublisher">
                                <Switch isToggled={isToggled} onToggle={ChangeToReader} />
                            </div>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => { navigate("/publisher/Uploadbook") }}>
                                <span><Icon2.TbBookUpload /></span>
                                <p>สร้างผลงานหนังสืออีบุ๊ก</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => { navigate("/publisher/Managebook") }}>
                                <span><Icon6.ImBooks /></span>
                                <p>บริหารจัดการหนังสืออีบุ๊ก</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <span><Icon2.TbHistory /></span>
                            <li>ประวัติหนังสืออีบุีกที่ถูกซื้อ</li>
                        </div>
                        <div className="nav-menu">
                            <span><Icon1.FaDonate /></span>
                            <li>บริหารจัดการเงินโดเนท</li>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => { navigate("/publisher/StatisticPublisher") }}>
                                <span><Icon2.TbChartHistogram /></span>
                                <p>รายงานผลสถิติ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => { navigate("/publisher/PublisherReport") }}>
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
                <div className={`top-nav-publisher ${NavOpen ? "top-nav-publisher-open" : "top-nav-publisher-close"}`}>
                    <div className="top-menubar">
                        <form className="notification">
                            <button type="button"><span><Icon5.IoMdNotifications /></span></button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

const Switch = ({ isToggled, onToggle }) => {

    return (
        <label className="switch">
            <input type="checkbox" id="SwitchToRead" checked={isToggled} onChange={onToggle} />
            <span className="slider" />
        </label>
    );
}

