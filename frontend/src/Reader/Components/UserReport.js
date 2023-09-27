import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import io from "socket.io-client";
import Swal from 'sweetalert2';
import "../Styles/report.css";
import { apiContext } from "../..";
import TimeAgo from 'react-timeago';
import thaiString from 'react-timeago/lib/language-strings/th';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import * as Icon from "react-icons/pi";
import * as Icon2 from "react-icons/vsc";

const socket = io.connect('http://localhost:4000');
const formatter = buildFormatter(thaiString);

export default function UserReport() {

    const backend = useContext(apiContext);

    const [IsToken, SetIsToken] = useState('');
    const [userID, SetUserID] = useState(0);
    const [reportStatus, SetReportStatus] = useState(false);

    //Input form report value
    const [reportType, SetReportType] = useState(0);
    const [otherReport, SetOtherReport] = useState('');
    const [reportDetail, SetReportDetail] = useState('');
    const [pictureEvident, SetPictureEvident] = useState(null);

    //Value report detail from database
    const [username, SetUsername] = useState('');
    const [reportID, SetReportID] = useState(0);
    const [type, SetType] = useState('');
    const [otherType, SetOtherType] = useState('');
    const [detail, SetDetail] = useState('');
    const [date, SetDate] = useState('');
    const [pictureUser, SetPictureUser] = useState(null);
    const [picEvident, SetPicEvident] = useState(null);
    const [statusNum, SetStatusNum] = useState(0);
    const chat_ch = useRef('');

    const [inputMessage, SetInputMessage] = useState("");
    const [messageList, SetMessageList] = useState([]);

    //Use memo to prevent receive double message
    const handleReceiveMessage = useMemo(() => (data) => {
        SetMessageList((list) => [...list, data]);
    }, []);

    const token = localStorage.getItem("token");

    useEffect(() => {

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
        const Getiduser = async () => {
            axios.post(`${backend}GetIDUser`, { email: decode }).then((response) => {
                if (response.data.status === 'ok') {
                    SetUserID(response.data.result);
                } else {
                    console.log('authen fail.');
                }
            });
        }

        //Check report in database that there are still in process
        axios.post(`${backend}CheckReport`, { userID: userID }).then((response) => {
            if (response.data.status === 'ok') {
                SetReportStatus(true);
                const results = response.data.result;
                SetPictureUser(results.pic_user);
                SetUsername(results.username);
                SetDate(results.date);
                SetType(results.type);
                SetOtherType(results.otherType);
                SetDetail(results.detail);
                SetPicEvident(results.pic_e);
                SetStatusNum(results.reportStatus);
                SetReportID(results.reportID);
                chat_ch.current = results.chat_ch;

                GetMessageReport(results.reportID);
                JoinChat();
            } else {
                SetReportStatus(false);
            }
        });

        //Get old history message
        function GetMessageReport(id) {
            axios.post(`${backend}GetMessageReport`, {reportID: id}).then((response) => {
                if (response.data.status === 'ok') {
                    SetMessageList(response.data.result);    
                } else {
                    console.log('Get message report fail.');
                }
            });
        }

        //Recive message from other user via socket api
        socket.on("receive_message", handleReceiveMessage);
    
        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };

    }, [IsToken, backend, token, userID, handleReceiveMessage]);

    const scrollDown = useRef(null);

    // Scroll to the bottom of the chat container whenever new messages are added
    useEffect(() => {
        if (scrollDown.current) {
            scrollDown.current.scrollIntoView({ behavior: 'smooth'});
        }
    }, [messageList]);

    function JoinChat() {
        if (chat_ch !== '') {
            socket.emit("join_chat", chat_ch.current);
        }
    }

    //Add zero in front of one digit number
    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    //Format date to YYYY/MM/DD hh:mm:ss
    function formatDate(date) {
        return (
            [
                date.getFullYear(),
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
            ].join('-') +
            ' ' +
            [
                padTo2Digits(date.getHours()),
                padTo2Digits(date.getMinutes()),
                padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    async function sendMessage() {
        const messageData = {
            chat_ch: chat_ch.current,
            userID: userID,
            reportID: reportID,
            author: username,
            message: inputMessage,
            time: formatDate(new Date(Date.now()))
        };

        SetMessageList((list) => [...list, messageData]);
        await socket.emit("send_message", messageData);
        SetInputMessage('');
    }

    function SendReport(event) {

        event.preventDefault();

        // Display a loading alert
        const loadingAlert = Swal.fire({
            icon: 'warning',
            title: 'อยู่ในระหว่างดำเนินการ...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
        });

        //Create form data for sending to node js
        const formData = new FormData();
        formData.append('reportType', reportType);
        formData.append('userID', userID);
        formData.append('reportDetail', reportDetail);

        if (pictureEvident !== null) {
            formData.append('pictureEvident', pictureEvident);
        }

        if (otherReport !== '') {
            formData.append('otherReport', otherReport);
        } else {
            formData.append('otherReport', 'null');
        }

        axios.post(`${backend}SendReport`, formData).then((response) => {

            //Close loading alert
            loadingAlert.close();

            if (response.data.status === 'ok') {
                Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินรายการสำเร็จ!',
                    text: 'ส่งเรื่องร้องเรียนไปที่ผู้ดูแลระบบเรียบร้อยแล้ว',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาดขึ้น',
                    text: 'ไม่สามารถส่งเรื่องร้องเรียนไปที่ผู้ดูแลระบบได้',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
            }
        });

        SetReportType(0);
        SetOtherReport('');
        SetReportDetail('');
        SetPictureEvident(null);
    }

    function ReportComplete() {

        axios.post(`${backend}ReportComplete`, { reportID: reportID }).then((response) => {
            if (response.data.status === 'ok') {
                Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินรายการสำเร็จ!',
                    text: 'คุณได้ยืนยันการรับแก้ไขปัญหาเรียบร้อยแล้ว',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาดขึ้น',
                    text: 'ไม่สามารถยืนยันการรับแก้ไขปัญหาได้',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
            }
        });
    }

    return (
        <>
            {!reportStatus ?
                <div className="report-to-admin">
                    <h1>ร้องเรียนหาผู้ดูแลระบบ</h1>
                    <div className="report-to-admin-form">
                        <form onSubmit={SendReport}>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="ReportType">*เลือกประเภทของเรื่องที่จะร้องเรียน</label>
                                <select id="ReportType" onChange={(e) => SetReportType(e.target.value)} required>
                                    <option value="">-เลือกประเภทเรื่องร้องเรียน-</option>
                                    <option value="1">พบข้อบกพร่องในการใช้งานหรือเจอบัคในเว็บไซต์</option>
                                    <option value="2">ปุ่มหรือลิ้งบนเว็บไซต์ไม่สามารถใช้งานได้</option>
                                    <option value="3">พบปัญหาในการดูหนังสือหรืออ่านหนังสือบนเว็บไซต์</option>
                                    <option value="4">พบปัญหาในการชำระเงินค่าหนังสือหรือจ่ายเงินโดเนท</option>
                                    <option value="5">พบเนื้อหาของหนังสือที่ไม่มีความเหมาะสม</option>
                                    <option value="6">พบหนังสือที่มีการละเมิดลิขสิทธิ์หรือไปก็อปผลงานของผู้อื่นมา</option>
                                    <option value="7">พบปัญหาที่เกี่ยวข้องกับบัญชีหรือการเข้าใช้งานในระบบ</option>
                                    <option value="8">พบผู้ใช้งานที่ประพฤติตัวไม่เหมาะสม</option>
                                    <option value="15">ข้อเสนอแนะและคำติชม</option>
                                    <option value="16">เรื่องอื่นๆ</option>
                                </select>
                            </div>
                            {reportType === '16' ?
                                <div className="input-box-up">
                                    <label className="up-label" htmlFor="OtherReport">*ใส่ชื่อเรื่องเกี่ยวกับเรื่องที่ต้องการจะร้องเรียน</label>
                                    <input type="text" id="OtherReport" placeholder="ใส่ชื่อเรื่องที่จะร้องเรียน" value={otherReport} onChange={(e) => SetOtherReport(e.target.value)} pattern="[a-zA-Zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อเรื่องที่จะร้องเรียนเป็นอักษรหรือตัวเลขไม่เกิน 30 ตัว" autoComplete="off"></input>
                                </div>
                                : ''}
                            <div className="input-box-up area">
                                <label className="up-label" htmlFor="ReportDetail">*ใส่ข้อความอธิบายลายละเอียดเกี่ยวกับเรื่องที่ร้องเรียน</label>
                                <textarea id="ReportDetail" value={reportDetail} onChange={(e) => SetReportDetail(e.target.value)} rows="5" cols="33" pattern="[a-zA-Zก-๏0-9]{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว" required></textarea>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="PictureEvident">อัปโหลดภาพหลักฐานประกอบ (กรณีที่มีภาพหลักฐาน)</label>
                                <input className="file" type="file" id="PictureEvident" onChange={(e) => { SetPictureEvident(e.target.files[0]) }} accept="image/png,image/jpeg"></input>
                            </div>
                            <button type="submit" className="btn-create-report">กดส่งเรื่องร้องเรียน</button>
                            <div className="bottom-gap" />
                        </form>
                    </div>
                </div> :
                <div className="report-detail-user">
                    <h1>ลายละเอียดเรื่องที่ร้องเรียนไปหาผู้ดูแลระบบ </h1>
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
                        {picEvident ?
                            <div className="evident">
                                <h4>ภาพหลักฐาน</h4>
                                <img src={picEvident} alt="picture_evident" />
                            </div> :
                            <div className="report-element no-evident">
                                <h4>ภาพหลักฐาน : </h4>
                                <p>ไม่มีรูปภาพหลักฐาน</p>
                            </div>
                        }
                        {statusNum === 1 ?
                            <div className="report-element alert">
                                <h2>"อยู่ในระหว่างรอให้ผู้ดูแลระบบมาตรวจสอบ"</h2>
                            </div>
                            :
                            <div className="report-element chat">
                                <div className="header">
                                    <span><Icon.PiChatsFill /></span>
                                    <h2>แชทสนทนา</h2>
                                </div>
                                <div className="underline" />
                                <div className="message-box">
                                    {messageList.map((data, index) => {
                                        return (
                                            data.author !== 'Admin' ?
                                                <div className="sender" key={index}>
                                                    <div className="message">
                                                        <p>{data.message}</p>
                                                    </div>
                                                    <div className="send-by">
                                                        <p>ส่งโดยคุณ</p>
                                                        <p><TimeAgo date={data.time} formatter={formatter} /></p>
                                                    </div>
                                                </div> :
                                                <div className="receiver" key={index}>
                                                    <div className="message">
                                                        <p>{data.message}</p>
                                                    </div>
                                                    <div className="send-by">
                                                        <p>ส่งโดย {data.author}</p>
                                                        <p><TimeAgo date={data.time} formatter={formatter} /></p>
                                                    </div>
                                                </div>
                                        )
                                    })}
                                    <div ref={scrollDown} />
                                </div>
                                <div className="input-message-box">
                                    <input type="text" id="chat" placeholder="พิมพ์ข้อความสนทนา" value={inputMessage} onChange={(e) => SetInputMessage(e.target.value)} />
                                    <button type="button" className="btn-send-message" onClick={sendMessage}><Icon2.VscSend />ส่งข้อความ</button>
                                </div>
                                <button type="button" onClick={ReportComplete} className="btn-report-complete">กดปุ่มยืนยันเมื่อปัญหาได้รับการแก้ไขแล้ว</button>
                            </div>
                        }
                    </div>
                </div>
            }
        </>
    );
}
