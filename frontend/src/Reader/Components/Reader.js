import React, {useContext,useState,useEffect} from "react";
import axios from "axios";
import "../Styles/Reader.css";
import { apiContext } from "../..";
import LogRegis from "./LogRegis";
import CardItem from "./CardItem";

function Reader() {

    const backend = useContext(apiContext);

    const [PreventReload,SetPreventReload] = useState(false);
    const [bookInfo,SetBookInfo] = useState([]);

    const sessionCheck = sessionStorage.getItem("UserStatus");

    useEffect(()=>{
        /*if(sessionCheck!=="reader") {
            sessionStorage.setItem("UserStatus","reader");
        }*/

        if(!PreventReload) {
            axios.get(`${backend}GetAllBook`).then((response)=>{
                SetPreventReload(true);

                if(response.data.status==='ok') {
                    SetBookInfo(response.data.results);
                    
                } else {
                    console.log('Can not get book infomation');
                }
            });
        }
        
    },[PreventReload,backend,sessionCheck]);

    return(
        <>
            <LogRegis />
            <div className="reader-items">
                {bookInfo ? 
                    <div className="card-items">
                        {bookInfo.map((item,index) =>(
                            <CardItem element={item} key={index}/> 
                        ))}  
                    </div> 
                :''}
            </div>
        </>
    );
}

export default Reader