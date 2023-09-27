import React, { useContext,useEffect,useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Style/ReportFromUser.css";
import { apiContext } from "../..";

export default function ReportFromUser() {

    const backend = useContext(apiContext);
    const [listData,SetListData] = useState([]);

    useEffect(()=>{

        axios.get(`${backend}GetReportFromUser`).then((response)=>{
            if(response.data.status === 'ok') {
                SetListData(response.data.result);
            } else if(response.data.status === 'datanotfound') {
                SetListData([]);
            } else {
                console.log('Get book request sell fail.');
            }
        });

    },[backend]);

    const navigate = useNavigate();

    return(
        <>
            <div className="report-from-user">
                <h1>รายการร้องเรียนจากผู้ใช้งาน </h1>
                <div className="manage-content">
                    <div className="content-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>รูปโปรไฟล์</th>
                                    <th>ชื่อผู้ใช้งาน</th>
                                    <th>เรื่องที่ร้องเรียน</th>
                                    <th>วันที่ร้องเรียน</th>
                                    <th>ลายละเอียด</th>
                                </tr>
                                {listData.length>0 ?
                                    listData.map((value,index)=>{
                                        return( 
                                            <tr key={index}>
                                                <td><img src={value.pic_url} alt="user profile"/></td>
                                                <td>{value.username}</td>
                                                {value.otherType!==null ? <td>{value.otherType}</td> : <td>{value.type}</td>}
                                                <td>{value.date}</td>
                                                <td><button onClick={()=>navigate("/admin/ReportDetail", {state: { reportID: value.reportID }})}>ดูลายละเอียด</button></td>
                                            </tr>    
                                        )
                                    })
                                : ''}
                            </tbody>
                        </table>
                        {listData.length>0 ? '':<h2>ไม่มีรายการร้องเรียนจากผู้ใช้งานในปัจจุบัน</h2>}
                    </div>
                </div>
            </div>
        </>
    );
}