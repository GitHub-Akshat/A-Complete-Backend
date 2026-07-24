import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import dns from 'dns';
dns.setServers(["1.1.1.1","8.8.8.8"])

import express from "express"

import dbConnect from "./DB/connect.js";
dbConnect();

const app = express();

app.get('/', (req,res) => {
    res.send('Server is Ready')
})

app.listen(process.env.PORT, ()=>{
console.log(`Server Started`)  
})