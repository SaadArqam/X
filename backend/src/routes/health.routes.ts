import { Router } from "express";
const router=Router()

router.get('/health',(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"OOPS server running!!!"
    })
})

export default router;