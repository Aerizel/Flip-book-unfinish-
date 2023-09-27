import { useContext, useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import "../Style/ReportFix.css";
import { apiContext } from "../..";
import TimeAgo from 'react-timeago';
import thaiString from 'react-timeago/lib/language-strings/th';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import * as Icon from "react-icons/pi";
import * as Icon2 from "react-icons/vsc";

const socket = io.connect('http://localhost:4000');
const formatter = buildFormatter(thaiString);

export default function ReportFix() {

    const backend = useContext(apiContext);

    const [IsToken, SetIsToken] = useState('');
    const [userID, SetUserID] = useState(0);
    //const [reportID, SetReportID] = useState(0);
    const [username, SetUsername] = useState('');
    const [type, SetType] = useState('');
    const [otherType, SetOtherType] = useState('');
    const [detail, SetDetail] = useState('');
    const [date, SetDate] = useState('');
    const [pictureUser, SetPictureUser] = useState(null);
    const [pictureEvident, SetPictureEvident] = useState(null);
    const [reportStatus, SetReportStatus] = useState(0);
    const chat_ch = useRef('');

    const [inputMessage, SetInputMessage] = useState("");
    const [messageList, SetMessageList] = useState([]);

    const token = localStorage.getItem("token");

    //Receive book id value from main page
    const location = useLocation();
    const reportID = location.state?.reportID;

    //Use memo to prevent receive double message
    const handleReceiveMessage = useMemo(() => (data) => {
        SetMessageList((list) => [...list, data]);
    }, []);

    useEffect(() => {

        let decode = ''

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
                SetReportStatus(results.reportStatus);
                chat_ch.current = results.chat_ch;
                GetMessageReport(results.reportID);
                JoinChat();
            } else {
                console.log('Get report detail fail.');
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

    }, [reportID, IsToken, token, backend, handleReceiveMessage]);

    const scrollDown = useRef(null);

    // Scroll to the bottom of the chat container whenever new messages are added
    useEffect(() => {
        if (scrollDown.current && messageList.length>0) {
            scrollDown.current.scrollIntoView({ behavior: 'smooth' });
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
            author: 'Admin',
            message: inputMessage,
            time: formatDate(new Date(Date.now()))
        };

        SetMessageList((list) => [...list, messageData]);
        await socket.emit("send_message", messageData);
        SetInputMessage('');
    }

    return (
        <>
            <div className="report-fix">
                <h1>ลายละเอียดเรื่องที่ร้องเรียน</h1>
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
                    <div className="report-element report-status">
                        <h4>สถานะเรื่องร้องเรียน : </h4>
                        {reportStatus === 2 ? <p>อยู่ในระหว่างดำเนินการ</p> : <p>ดำเนินการเสร็จสิ้น</p>}
                    </div>
                    <div className="report-element chat">
                        <div className="header">
                            <span><Icon.PiChatsFill /></span>
                            <h2>แชทสนทนา</h2>
                        </div>
                        <div className="underline" />
                        <div className="message-box">
                            {messageList.map((data, index) => {
                                return (
                                    data.author === 'Admin' ?
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
                    </div>
                </div>
            </div>
        </>
    );
}