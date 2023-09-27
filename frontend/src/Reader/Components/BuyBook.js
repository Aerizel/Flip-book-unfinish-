import { useContext,useState,useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../Styles/Buybook.css";
import bookcover from "../icon/book-cover-demo.jpg";
import { apiContext } from "../..";

export default function BuyBook(){

    const backend = useContext(apiContext);

    const [bookID,SetBookID] = useState('');
    const [totalPrice,SetTotalPrice] = useState(0);
    const [listdata,SetListdata] = useState([]);

    //Receive book id value from main page
    const location = useLocation();

    useEffect(()=>{

        let bookID = 0;
        bookID = location.state?.bookID;
        SetBookID(bookID);

        axios.post(`${backend}GetBuyBook`, {bookID : bookID}).then((response)=>{
            if(response.data.status==='ok') {
                
                const bookinfo = response.data.results;
                //let newData = [];
                let price = 0;

                bookinfo.forEach(value => {
                    price += value.price;
                }); 
 
                SetTotalPrice(price);
                SetListdata(response.data.results);

            } else {
                console.log('Can not get bookcover');
            }
        });

    },[location.state.bookID,backend]);

    return(
        <>
            <div className="buybook">
                <h1>ชำระค่าหนังสือ</h1>
                <div className="item-list">
                    <table>
                        <tbody>
                            <tr>
                                <th className="book-pic">รูปภาพหนังสือ</th>
                                <th>ชื่อหนังสือ</th>
                                <th>ราคา</th>
                            </tr>
                            {listdata.map((value,index)=>{
                               return(
                                    <tr key={index}>
                                        <td className="book-pic"><img src={value.image} alt="bookcover"/></td>
                                        <td>{value.bookname}</td>
                                        <td>{value.price}</td>
                                    </tr>
                               )
                            })}
                            <tr>
                                <td className="total-bill alert">รวมเป็นเงินที่ต้องจ่ายทั้งหมด</td>
                                <td className="total-bill"></td>
                                <td className="total-bill">{totalPrice} บาท</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
        
    );
}