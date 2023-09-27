import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "../Style/ReportDetail.css";
import { apiContext } from "../..";

export default function ReportDetail() {

    const backend = useContext(apiContext);

    const [IsToken, SetIsToken] = useState('');
    const [userID, SetUserID] = useState(0);
    const [reportID, SetReportID] = useState(0);
    const [username, SetUsername] = useState('');
    const [type, SetType] = useState('');
    const [otherType, SetOtherType] = useState('');
    const [detail, SetDetail] = useState('');
    const [date, SetDate] = useState('');
    const [pictureUser, SetPictureUser] = useState(null);
    const [pictureEvident, SetPictureEvident] = useState(null);

    const token = localStorage.getItem("token");

    const toastId = useRef(null);

    //Receive book id value from main page
    const location = useLocation();

    const navigate = useNavigate();

    useEffect(() => {

        let reportID = 0;
        reportID = location.state?.reportID;
        SetReportID(reportID);

        let decode = '';

        //Check if token is null or not
        if (token) {
            const token = JSON.parse(localStorage.getItem("token"));
            SetIsToken(token);
        } else {
            localStorage.setItem('token', '');
        }

        //Check jwt if token is is not null
        if (IsToken !== '') {

            const config = {
                headers: { Authorization: `Bearer ${IsToken}` }
            };

            const bodyParameters = {
                key: "value"
            };

            axios.post(`${backend}CheckToken`,
                bodyParameters,
                config
            ).then((response) => {
                if (response.data.status === 'ok') {
                    decode = response.data.decoded.email;
                    Getiduser();
                } else {
                    console.log('authen fail.');
                }
            });

        }

        //Get user id from backend
        const Getiduser = () => {
            axios.post(`${backend}GetIDUser`, { email: decode }).then((response) => {
                if (response.data.status === 'ok') {
                    SetUserID(response.data.result);
                } else {
                    console.log('authen fail.');
                }
            });
        }

        axios.post(`${backend}GetReportDetail`, { reportID: reportID }).then((response) => {
            if (response.data.status === 'ok') {
                const results = response.data.result;
                SetPictureUser(results.pic_user);
                SetUsername(results.username);
                SetDate(results.date);
                SetType(results.type);
                SetOtherType(results.otherType);
                SetDetail(results.detail);
                SetPictureEvident(results.pic_e);
            } else {
                console.log('Get book request sell fail.');
            }
        });

    }, [location.state?.reportID, IsToken, token, backend]);

    function AcceptReport() {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}AcceptReport`, { adminID: userID, reportID: reportID }).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: `รับเรื่องร้องเรียนเป็นที่เรียบร้อยแล้ว`,
                    type: "success",
                    isLoading: false,
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",  
                });
                //console.log('accept report complete.');
                navigate('/admin/ReportFromUser');
            } else {
                toast.update(toastId.current, {
                    render: "ไม่สามารถรับเรื่องร้องเรียนได้",
                    type: "error",
                    isLoading: false,
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                //console.log('Can not accept report.');
            }
        });
    }

    return (
        <>
            <div className="report-detail">
                <h1>ลายละเอียดเรื่องที่ร้องเรียน </h1>
                <div className="report-content">
                    <div className="report-element owner">
                        <h4>ผู้ที่ร้องเรียน</h4>
                        <div className="profile">
                            <img src={pictureUser} alt="profile_user" />
                            <div className="name">
                                <h4>ชื่อผู้ใช้งาน</h4>
                                <p>{username}</p>
                            </div>
                        </div>
                    </div>
                    <div className="report-element date">
                        <h4>วันที่ร้องเรียน :</h4>
                        <p>{date}</p>
                    </div>
                    <div className="report-element report-topic">
                        <h4>หัวข้อเรื่อง :</h4>
                        {otherType ? <p>{otherType}</p> : <p>{type}</p>}
                    </div>
                    <div className="report-element text-detail">
                        <h4>เนื้อหาข้อความ :</h4>
                        <p>{detail}</p>
                    </div>
                    {pictureEvident ?
                        <div className="evident">
                            <h4>ภาพหลักฐาน</h4>
                            <img src={pictureEvident} alt="picture_evident" />
                        </div> :
                        <div className="report-element no-evident">
                            <h4>ภาพหลักฐาน : </h4>
                            <p>ไม่มีรูปภาพหลักฐาน</p>
                        </div>
                    }
                    <div className="report-element accept">
                        <button type="button" onClick={AcceptReport}>รับเรื่องร้องเรียน</button>
                    </div>
                </div>
            </div>
        </>
    );
}