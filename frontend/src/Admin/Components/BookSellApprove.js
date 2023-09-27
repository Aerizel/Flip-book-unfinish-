import React, { useContext,useEffect,useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Style/BookSellApprove.css";
import { apiContext } from "../..";

export default function BookSellApprov() {

    const backend = useContext(apiContext);
    const [listData,SetListData] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(()=>{

        axios.get(`${backend}GetBookRequestSell`).then((response)=>{
            if(response.data.status === 'ok') {
                SetListData(response.data.result);
            } else if(response.data.status === 'datanotfound') {
                SetListData([]);
            } else {
                console.log('Get book request sell fail.');
            }
        });

    },[backend,token]);

    const navigate = useNavigate();

    return(
        <>
            <div className="booksell-approve">
                <h1>รายการขออนุญาติสิทธิการวางขายหนังสือ </h1>
                <div className="manage-content">
                    <div className="content-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>ปกหนังสือ</th>
                                    <th>ชื่อหนังสือ</th>
                                    <th>ผู้ใช้ที่ส่งคำขอ</th>
                                    <th>วันที่ส่งคำร้อง</th>
                                    <th>ลายละเอียด</th>
                                </tr>
                                {listData.length>0 ?
                                    listData.map((value,index)=>{
                                        return( 
                                            <tr key={index}>
                                                <td><img src={value.bookcover} alt="bookcover"/></td>
                                                <td>{value.bookname}</td>
                                                <td>{value.username}</td>
                                                <td>{value.sell_approve_date}</td>
                                                <td><button onClick={()=>navigate('/admin/BookDetailApprove',{state : {bookID : value.bookID}})}>ดูลายละเอียด</button></td>
                                            </tr>    
                                        )
                                    })
                                : ''}
                            </tbody>
                        </table>
                        {listData.length>0 ? '':<h2>ไม่มีรายการส่งคำร้องขอวางขายหนังสือในปัจจุบัน</h2>}
                    </div>
                </div>
            </div>
        </>
    );
}