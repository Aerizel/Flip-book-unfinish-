import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import "../Style/StatisticAdmin.css";
import { apiContext } from "../..";
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

export default function StatisticAdmin() {

    const backend = useContext(apiContext);

    const [reportNotAccept, SetReportNotAccept] = useState(0);
    const [reportAccept, SetReportAccept] = useState(0);
    const [sellApprove, SetSellApprove] = useState(0);
    const [userAmount, SetUserAmount] = useState(0);
    const [bookAmount, SetBookAmount] = useState(0);
    const [bookSellAmount, SetBookSellAmount] = useState(0);
    const [bookFreeAmount, SetBookFreeAmount] = useState(0);
    const [chartBookType, SetChartBookType] = useState(null);
    const [readRanking, SetReadRanking] = useState([]);
    const [sellRanking, SetSellRanking] = useState([]);
    const [bookTypeRanking, SetBookTypeRanking] = useState([]);

    const token = localStorage.getItem("token");
    const [IsToken, SetIsToken] = useState('');

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            maxWidth: 200,
            position: "right"
          },
        },
    };

    useEffect(() => {

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
                    GetStatistic();
                } else {
                    console.log('authen fail.');
                }
            });
        }

        function GetStatistic() {
            axios.post(`${backend}GetStatisticAdmin`, { userID: userID }).then((response) => {
                if (response.data.status === 'ok') {

                    const dataone = response.data.reportStatistics;
                    SetReportNotAccept(dataone.report);
                    SetReportAccept(dataone.report_acc);
                    SetSellApprove(dataone.sell_approve);

                    const datatwo = response.data.userStatistics;
                    SetUserAmount(datatwo.user_total);

                    const datathree = response.data.bookStatistics;
                    SetBookAmount(datathree.aboutbook.book_total);
                    SetBookSellAmount(datathree.aboutbook.booksell_total);
                    SetBookFreeAmount(datathree.aboutbook.bookfree_total);

                    let typename = [];
                    let amount = [];
                    (datathree.typeamount).forEach(element => {
                        typename.push(element.typename);
                        amount.push(element.amount);
                    });

                    SetChartBookType({
                        labels: typename,
                        datasets: [
                            {
                                label: 'มีจำนวนหนังสือ',
                                data: amount,
                                backgroundColor: ['#0D79FA','#0BA3DE','#00F2F5','#0BDEA6','#0DFA78','#CADE0B','#FAD900'],
                                hoverOffset: 4,
                            }
                        ],
                    });

                    SetReadRanking(datathree.readRanking);
                    SetSellRanking(datathree.sellRanking);
                    SetBookTypeRanking(datathree.booktypeRanking);

                } else {
                    console.log('Get manage book info fail.');
                }
            });
        }

    }, [IsToken, backend, token]);

    const currentYear = new Date().getFullYear();

    return (
        <>
            <div className="statistic-admin">
                <h1>รายงานผลสถิติ</h1>
                <div className="three-display">
                    <div className="display view">
                        <h3>เรื่องร้องเรียนที่ยังไม่ได้ถูกรับ</h3>
                        <p>{reportNotAccept} เรื่อง</p>
                    </div>
                    <div className="display sell">
                        <h3>เรื่องร้องเรียนที่ยังอยู่ในกระบวนการ</h3>
                        <p>{reportAccept} เรื่อง</p>
                    </div>
                    <div className="display income">
                        <h3>จำนวนขออนุญาติสิทธิวางขายหนังสือ</h3>
                        <p>{sellApprove} เรื่อง</p>
                    </div>
                </div>
                <div className="underline" />
                <div className="one-display-chart user">
                    <div className="display">
                        <h3>ข้อมูลผู้ใช้งาน</h3>
                        <p>สมาชิกทั้งหมดในระบบปัจจุบัน {userAmount} คน</p>
                        <p>สมาชิกที่ล็อกอินอยู่ในระบบ</p>
                        <p>จำนวนครั้งที่คนกดเข้ามาดูเว็บไซต์</p>
                    </div>
                    <div className="one-chart">
                        <h3>ยอดสถิติผู้เข้ามาใช้งานในระบบปี {currentYear}</h3>
                        <div className="graph">

                        </div>
                    </div>
                </div>
                <div className="underline" />
                <div className="one-display-chart book">
                    <div className="one-chart">
                        <h3>สัดส่วนประเภทของหนังสือในระบบปัจจุบัน {currentYear}</h3>
                        <div className="pie">
                            {chartBookType !== null ? <Chart type='pie' data={chartBookType}  options={pieOptions}/> : ''}
                        </div>
                    </div>
                    <div className="display">
                        <h3>ข้อมูลหนังสือ</h3>
                        <p>หนังสือทั้งหมดในระบบปัจจุบัน {bookAmount} เล่ม</p>
                        <p>หนังสือที่วางขาย {bookSellAmount} เล่ม</p>
                        <p>หนังสือที่อ่านฟรี {bookFreeAmount} เล่ม</p>
                    </div>
                </div>
                <div className="two-ranking">
                    <div className="ranking book-view">
                        <h3>อันดับรายชื่อหนังสือที่อ่านเยอะที่สุด</h3>
                        {readRanking.length === 0 ?
                            <p className="none">ยังไม่มีรายการหนังสือ</p> :
                            readRanking.map((value, index) => {
                                return (
                                    <div className="data-list" key={index}>
                                        <p className="name">{index + 1}.{value.bookname}</p>
                                        <p className="count">{value.view_total} ครั้ง</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="ranking book-sell">
                        <h3>ลำดับรายชื่อหนังสือที่ซื้อเยอะที่สุด</h3>
                        {sellRanking.length === 0 ?
                            <p className="none">ยังไม่มีรายการหนังสือ</p> :
                            sellRanking.map((value, index) => {
                                return (
                                    <div className="data-list" key={index}>
                                        <p className="name">{index + 1}.{value.bookname}</p>
                                        <p className="count">{value.buy_total} ครั้ง</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="ranking book-type">
                        <h3>หมวดหนังสือยอดนิยม</h3>
                        {bookTypeRanking.length === 0 ?
                            <p className="none">ยังไม่มีรายการหนังสือ</p> :
                            <table>
                                <tbody>
                                    <tr className="title">
                                        <th>ประเภทหนังสือ</th>
                                        <th>ยอดอ่าน</th>
                                        <th>ยอดขาย</th>
                                    </tr>
                                    {bookTypeRanking.map((value, index) => {
                                        return (
                                            <tr key={index}>
                                                <td><p className="name">{index + 1}.{value.type_name}</p></td>
                                                <td>{value.total_view ? <p className="view">{value.total_view}</p> : <p className="sell">0</p>}</td>
                                                <td>{value.total_sell ? <p className="sell">{value.total_sell}</p> : <p className="sell">0</p>}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}