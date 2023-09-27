import React, { useContext,useEffect,useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/ManageBook.css";
import { apiContext } from "../..";

export default function ManageBook () {

    const backend = useContext(apiContext);
    const [IsToken,SetIsToken] = useState('');
    const [userEmail,SetUserEmail] = useState('');
    const [listData,SetListData] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(()=>{

        let decode = '';
        let userID = 0;

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
                    SetUserEmail(response.data.decoded.email);
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
                    userID = response.data.result;
                    GetManageBook();
                } else {
                    console.log('authen fail.');
                }
            });
        }

        function GetManageBook() {
            axios.post(`${backend}GetManageBook`, {userID: userID}).then((response)=>{
                if(response.data.status === 'ok') {
                    SetListData(response.data.results);
                } else {
                    console.log('Get manage book info fail.');
                }
            });
        }

    },[IsToken,backend,token]);

    const navigate = useNavigate();

    return(
        <>
            <div className="manage-title">
                <h1>บริหารจัดการหนังอีบุ๊ก</h1>
                <div className="manage-content">
                    <div className="content-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>ปกหนังสือ</th>
                                    <th>ชื่อหนังสือ</th>
                                    <th>สถานะหนังสือ</th>
                                    <th>วันที่อัปโหลด</th>
                                    <th>ยอดเข้าชม/ยอดซื้อ</th>
                                    <th>ความคิดเห็น</th>
                                    <th>คะแนนหนังสือ</th>
                                    <th>ลายละเอียด</th>
                                </tr>
                                {listData.map((value,index)=>{
                                    return( 
                                        <tr key={index}>
                                            <td><img src={value.url} alt="bookcover"/></td>
                                            <td>{value.bookname}</td>
                                            <td>{value.status}</td>
                                            <td>{value.date}</td>
                                            {value.status!=='วางขาย' ? <td>{value.view}</td> : <td>{value.sell}</td>}
                                            <td>{value.comment}</td>
                                            <td>{value.score}</td>
                                            <td>
                                                {value.statusnum===4 || value.statusnum===5 || value.statusnum===6 ?
                                                    <button onClick={()=>navigate("/publisher/ViewBookSell", {state: {bookID: value.bookID, userEmail: userEmail}})}>ดูลายละเอียด</button> :
                                                    <button onClick={()=>navigate("/publisher/Editbook", {state: {bookID: value.bookID, userEmail: userEmail}})}>ดูลายละเอียด</button>}
                                            </td>
                                        </tr>    
                                    )
                                })}
                            </tbody>
                        </table>
                        {!listData.length ? <h2>ยังไม่มีรายการหนังสือที่ถูกอัปโหลด</h2>:''}
                    </div>
                </div>
            </div>
        </>
    );
}


 