import dns from 'dns';
dns.setServers(["1.1.1.1", "8.8.8.8"])

import app from './app.js';

import dbConnect from "./DB/connect.js";
dbConnect()
    .then(
        app.listen(process.env.PORT, () => {
            console.log(`Server Started At Port : ${process.env.PORT}`)
        })
    )
    .catch((err) => {
        console.log("MongoDB Error")
    })
