import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import "../Styles/StatisticPublisher.css";
import { apiContext } from "../..";
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

export default function StatisticPublisher() {

    const backend = useContext(apiContext);

    const [view_total, SetViewTotal] = useState(0);
    const [buy_total, SetBuyTotal] = useState(0);
    const [graphData, SetGraphData] = useState(null);
    const [readRanking, SetReadRanking] = useState([]);
    const [buyRanking, SetBuyRanking] = useState([]);

    const token = localStorage.getItem("token");
    const [IsToken, SetIsToken] = useState('');

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
            axios.post(`${backend}GetStatisticPubliser`, { userID: userID }).then((response) => {
                if (response.data.status === 'ok') {
                    const data = response.data;
                    SetViewTotal(data.totalReadBuy.total_view);
                    SetBuyTotal(data.totalReadBuy.total_sell);
                    SetGraphData({
                        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
                        datasets: [
                            {
                                label: 'ยอดอ่านหนังสือ',
                                data: data.readGraph,
                                fill: true,
                                borderColor: 'rgb(30, 199, 253)',
                                backgroundColor: 'rgb(30, 199, 253, 0.5)',
                            },
                            {
                                label: 'ยอดซื้อหนังสือ',
                                data: data.buyGraph,
                                fill: true,
                                borderColor: 'rgb(90, 204, 54)',
                                backgroundColor: 'rgb(90, 204, 54, 0.5)',
                            },
                        ],
                    });
                    SetReadRanking(data.read);
                    SetBuyRanking(data.buy);
                } else {
                    console.log('Get manage book info fail.');
                }
            });
        }

    }, [IsToken, backend, token]);

    const currentYear = new Date().getFullYear();

    return (
        <>
            <div className="statistic-publisher">
                <h1>รายงานผลสถิติ</h1>
                <div className="three-display">
                    <div className="display view">
                        <h3>จำนวนครั้งของคนที่กดเข้ามาอ่านทั้งหมด</h3>
                        <p>{view_total ? view_total : 0} ครั้ง</p>
                    </div>
                    <div className="display sell">
                        <h3>จำนวนครั้งของคนที่กดซื้อทั้งหมด</h3>
                        <p>{buy_total} ครั้ง</p>
                    </div>
                    <div className="display income">
                        <h3>จำนวนเงินจากยอดขายที่ทำได้ทั้งหมด</h3>
                        <p>0 บาท</p>
                    </div>
                </div>
                <div className="one-graph">
                    <h3>ยอดสถิติคนที่เข้ามาอ่านและซื้อหนังสือปี {currentYear}</h3>
                    <div className="graph">
                        {graphData !== null ? <Line data={graphData} /> : ''}
                    </div>
                </div>
                <div className="two-ranking">
                    <div className="ranking book-view">
                        <h3>ลำดับรายชื่อหนังสือที่อ่านเยอะที่สุด</h3>
                        {readRanking.length === 0 ?
                            <p className="none">ยังไม่มีรายการหนังสือ</p> :
                            readRanking.map((value, index) => {
                                return (
                                    <div className="data-list" key={index}>
                                        <p className="name">{index+1}.{value.bookname}</p>
                                        <p className="count">{value.view_total} ครั้ง</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="ranking book-sell">
                        <h3>ลำดับรายชื่อหนังสือที่ซื้อเยอะที่สุด</h3>
                        {buyRanking.length === 0 ?
                            <p className="none">ยังไม่มีรายการหนังสือ</p> :
                            buyRanking.map((value, index) => {
                                return (
                                    <div className="data-list" key={index}>
                                        <p className="name">{index+1}.{value.bookname}</p>
                                        <p className="count">{value.buy_total} ครั้ง</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
}