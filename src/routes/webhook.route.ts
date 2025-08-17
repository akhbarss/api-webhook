import express, { Request, Response, Router } from 'express';
import { prisma } from '../prisma';
import { verifyPushMsg } from '../utils/verifyPush';
import { PATH_URL_WEBHOOK, SHOPEE_LIVE_PUSH_PARTNER_KEY } from '../config';

const router = Router();

router.post(
    '/',
    express.json({
        verify: (req: any, _res, buf) => {
            console.log({ rawBody: req.rawBody, buf, bufstring: buf.toString(), body: req.body })
            req.rawBody = buf.toString(); // simpan raw body di request
        },
    }),
    async (req: Request, res: Response) => {
        console.log("🔥🔥🔥🔥🔥🔥 WEBHOOK 🔥🔥🔥🔥🔥🔥")

        const url = PATH_URL_WEBHOOK; // ganti sesuai URL yang Shopee pakai
        const body = req.body; // pakai rawBody, bukan req.body
        const rawBody = (req as any).rawBody; // pakai rawBody, bukan req.body
        const authorization = req.headers["authorization"] || "";

        const isValid = verifyPushMsg(url, rawBody, SHOPEE_LIVE_PUSH_PARTNER_KEY, authorization);

        if (!isValid) {
            console.error("❌ Invalid signature");
            return res.status(201).send(false);
        }
        if (body.code == 0) {
            await prisma.webhookLog.create({
                data: {
                    shopId: "TEST VERIFY",
                    code: body.code,
                    msgId: "TEST VERIFY",
                    data: body, // simpan JSON full push dari Shopee
                },
            });
        } else {

            await prisma.webhookLog.create({
                data: {
                    shopId: String(body.shopid),
                    code: body.code,
                    msgId: body.msg_id,
                    data: body, // simpan JSON full push dari Shopee
                },
            });
        }


        console.log("✅ Push message verified:", req.body);
        res.status(200).json({ success: true })
    }
);



export { router as webhookRoute };

