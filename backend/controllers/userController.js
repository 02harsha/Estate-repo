const db = require("../config/db");

import {generateReferralUUID} from "../services/unqReferralGenerationService"
exports.userRegistration=(req,res)=>{
    const {full_name,email,phone_number,password,referral_code} = req.body

}

exports.userLogin=(req,res)=>{
    const {email,phone_number}=req.body

}