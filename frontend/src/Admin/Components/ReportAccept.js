import React, { useContext,useEffect,useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Style/ReportAccept.css";
import { apiContext } from "../..";

export default function ReportAccept() {

    const backend = useContext(apiContext);
    const [IsToken, SetIsToken] = useState('');
    //const [userID,SetUserID] = useState(0);
    const [listData,SetListData] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(()=>{

        let decode = '';
        let userID = 0;

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
                    userID = response.data.result;
                    GetReport();
                } else {
                    console.log('authen fail.');
                }
            });
        }

        function GetReport() {
            axios.post(`${backend}GetMyReportAccept`,{ adminID: userID }).then((response)=>{
                if(response.data.status === 'ok') {
                    SetListData(response.data.result);
                } else if(response.data.status === 'datanotfound') {
                    SetListData([]);
                } else {
                    console.log('Get book request sell fail.');
                }
            });
        }

    },[backend,IsToken,token]);

    const navigate = useNavigate();

    return(
        <>
            <div className="report-my-accept">
                <h1>รายการเรื่องร้องเรียนที่รับมา</h1>
                <div className="manage-content">
                    <div className="content-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>รูปโปรไฟล์</th>
                                    <th>ชื่อผู้ใช้งาน</th>
                                    <th>เรื่องที่ร้องเรียน</th>
                                    <th>วันที่ร้องเรียน</th>
                                    <th>สถานะ</th>
                                    <th>ลายละเอียด</th>
                                </tr>
                                {listData.length ?
                                    listData.map((value,index)=>{
                                        return( 
                                            <tr key={index}>
                                                <td><img src={value.pic_url} alt="user profile"/></td>
                                                <td>{value.username}</td>
                                                {value.otherType!==null ? <td>{value.otherType}</td> : <td>{value.type}</td>}
                                                <td>{value.date}</td>
                                                {value.reportStatus===2 ? <td><div className="status in-process">กำลังดำเนินการ</div></td> : <td><div className="status complete">ดำเนินการเสร็จสิ้น</div></td>}
                                                <td><button onClick={()=>navigate("/admin/ReportFix", {state: { reportID: value.reportID }})}>ดูลายละเอียด</button></td>
                                            </tr>    
                                        )
                                    })
                                : ''}
                            </tbody>
                        </table>
                        {!listData.length ? <h2>ยังไม่มีรายการรับเรื่องร้องเรียนจากผู้ใช้งาน</h2>:''}
                    </div>
                </div>
            </div>
        </>
    );
}