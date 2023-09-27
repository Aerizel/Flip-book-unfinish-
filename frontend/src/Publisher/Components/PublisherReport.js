import React, {useContext,useEffect,useState} from "react";
import axios from "axios";
import "../Styles/PublisherReport.css";
import { apiContext } from "../..";

export default function PublisherReport() {

    const backend = useContext(apiContext);

    const [IsToken,SetIsToken] = useState('');
    const [userID,SetUserID] = useState(0);
    const [reportType,SetReportType] = useState(0);
    const [otherReport,SetOtherReport] = useState('');
    const [reportDetail,SetReportDetail] = useState('');
    const [pictureEvident,SetPictureEvident] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(()=>{

        let decode = '';

        //Check if token is null or not
        if(token) {
            const token = JSON.parse(localStorage.getItem("token"));
            SetIsToken(token);
        } else {
            localStorage.setItem('token','');
        }

        //Check jwt if token is is not null
        if(IsToken!=='') {
            
            const config = {
                headers: { Authorization: `Bearer ${IsToken}` }
            };
            
            const bodyParameters = {
               key: "value"
            };

            axios.post(`${backend}CheckToken`,
                bodyParameters,
                config
            ).then((response)=>{
                if(response.data.status === 'ok') {
                    decode = response.data.decoded.email;
                    Getiduser();
                } else {
                    console.log('authen fail.');
                }
            });

        }

        //Get user id from backend
        const Getiduser =()=> {
            axios.post(`${backend}GetIDUser`, {email: decode}).then((response)=>{
                if(response.data.status === 'ok') {
                    SetUserID(response.data.result);
                } else {
                    console.log('authen fail.');
                }
            });
        }

    },[IsToken,backend,token]);

    function SendReport(event) {

        event.preventDefault();

        //Create form data for sending to node js
        const formData = new FormData();
        formData.append('reportType', reportType);
        formData.append('userID', userID);
        formData.append('reportDetail', reportDetail);
        
        if(pictureEvident!==null) {
            formData.append('pictureEvident', pictureEvident);
        } 

        if(otherReport!=='') {
            formData.append('otherReport', otherReport);
        } else {
            formData.append('otherReport', 'null');
        }

        axios.post(`${backend}SendReport`, formData ).then((response) => {
            if(response.data.status === 'ok') {
                console.log("Send report complete.");
            } else {
                console.log("Send report fail.");
            }
        });

        SetReportType(0);
        SetOtherReport('');
        SetReportDetail('');
        SetPictureEvident(null);
    }

    return (
        <>
            <div className="publisher-report">
                <h1>ร้องเรียนหาผู้ดูแลระบบ</h1>
                <div className="report-to-admin-form">
                    <form onSubmit={SendReport}>
                        <div className="input-box-up">
                            <label className="up-label" htmlFor="ReportType">*เลือกประเภทของเรื่องที่จะร้องเรียน</label>
                            <select id="ReportType" onChange={(e) => SetReportType(e.target.value)} required>
                                <option value="">-เลือกประเภทเรื่องร้องเรียน-</option>
                                <option value="1">พบข้อบกพร่องในการใช้งานหรือเจอบัคในเว็บไซต์</option>
                                <option value="2">ปุ่มหรือลิ้งบนเว็บไซต์ไม่สามารถใช้งานได้</option>
                                <option value="9">พบปัญหาในการอัปโหลดหนังสืออีบุ๊ก</option>
                                <option value="10">พบปัญหาในการวางขายหนังสืออีบุ๊ก</option>
                                <option value="11">พบปัญหาในหน้าบริหารจัดการหนังสืออีบุ๊ก</option>
                                <option value="12">พบปัญหาในหน้าแก้ไขข้อมูลหนังสือ</option>
                                <option value="13">พบปัญหาในการจัดการระบบเงินโดเนท</option>
                                <option value="14">พบปัญหาในการดูผลสถิติ</option>
                                <option value="15">ข้อเสนอแนะและคำติชม</option>
                                <option value="16">เรื่องอื่นๆ</option>
                            </select>
                        </div>
                        {reportType === '16' ? 
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="OtherReport">*ใส่ชื่อเรื่องเกี่ยวกับเรื่องที่ต้องการจะร้องเรียน</label>
                                <input type="text" id="OtherReport" placeholder="ใส่ชื่อเรื่องที่จะร้องเรียน" value={otherReport} onChange={(e)=>SetOtherReport(e.target.value)} pattern="[a-zA-Zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อเรื่องที่จะร้องเรียนเป็นอักษรหรือตัวเลขไม่เกิน 30 ตัว" autoComplete="off"></input>
                            </div>
                        : ''}
                        <div className="input-box-up area">
                            <label className="up-label" htmlFor="ReportDetail">*ใส่ข้อความอธิบายลายละเอียดเกี่ยวกับเรื่องที่ร้องเรียน</label>
                            <textarea id="ReportDetail" value={reportDetail} onChange={(e) => SetReportDetail(e.target.value)} rows="5" cols="33" pattern="[a-zA-Zก-๏0-9]{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว" required></textarea>
                        </div>
                        <div className="input-box-up">
                            <label className="up-label" htmlFor="PictureEvident">อัปโหลดภาพหลักฐานประกอบ (กรณีที่มีภาพหลักฐาน)</label>
                            <input className="file" type="file" id="PictureEvident" onChange={(e) => {SetPictureEvident(e.target.files[0])}} accept="image/png,image/jpeg"></input>
                        </div>
                        <button type="submit" className="btn-create-report">กดส่งเรื่องร้องเรียน</button>
                        <div className="bottom-gap"/>
                    </form>
                </div>
            </div>
        </>
    );
}
