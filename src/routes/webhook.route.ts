import express, { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { verifyPushMsg } from '../utils/verifyPush';
import { PATH_URL_WEBHOOK, SHOPEE_LIVE_PUSH_PARTNER_KEY } from '../config/config';
import { handleWebhookByCode } from '../controller/webhook.controller';

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
        console.log({ body })
        console.log({ rawBody })
        console.log({ authorization })

        const isValid = verifyPushMsg(url, rawBody, SHOPEE_LIVE_PUSH_PARTNER_KEY, authorization);

        if (!isValid) {
            console.error("❌ Invalid signature");
            return res.status(201).send(false);
        }
        // if (body.code == 0) {
        //     await prisma.webhookLog.create({
        //         data: {
        //             shopId: "TEST VERIFY",
        //             code: body.code,
        //             msgId: "TEST VERIFY",
        //             data: body, // simpan JSON full push dari Shopee
        //         },
        //     });
        // } else if (body.code == 3) {


        // }


        try {
            // Lempar ke controller
            await handleWebhookByCode(body);
            // res.status(200).json({ success: true });
            res.status(200).json();
        } catch (err) {
            console.error('❌ Error handling webhook:', err);
            res.status(500).json({ success: false, error: (err as Error).message });
        }
    }
)




export { router as webhookRoute };

