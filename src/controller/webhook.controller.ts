import { AppStatus, PackageStatus, ShopeeStatus } from '@prisma/client';
import { prisma } from '../prisma';

function mapPackageStatus(value: number): PackageStatus {
    switch (value) {
        case 1: return PackageStatus.PENDING;
        case 2: return PackageStatus.TO_PROCESS;
        case 3: return PackageStatus.PROCESSED;
        default: throw new Error("Unknown package status: " + value);
    }
}


function mapShopeeStatusToAppStatus(status: ShopeeStatus): AppStatus {
    switch (status) {
        case ShopeeStatus.UNPAID:
            return AppStatus.BELUM_BAYAR;

        case ShopeeStatus.READY_TO_SHIP:
        case ShopeeStatus.PROCESSED:
            return AppStatus.PERLU_DIPROSES;

        case ShopeeStatus.SHIPPED:
            return AppStatus.DIKIRIM;

        case ShopeeStatus.TO_CONFIRM_RECEIVE:
            return AppStatus.MENUNGGU_KONFIRMASI;

        case ShopeeStatus.COMPLETED:
            return AppStatus.SELESAI;

        case ShopeeStatus.RETRY_SHIP:
            return AppStatus.KIRIM_ULANG;

        case ShopeeStatus.IN_CANCEL:
            return AppStatus.DALAM_PEMBATALAN;

        case ShopeeStatus.CANCELLED:
            return AppStatus.DIBATALKAN;

        case ShopeeStatus.TO_RETURN:
            return AppStatus.SEDANG_RETUR;

        default:
            return AppStatus.PERLU_DIPROSES;
    }
}

export async function handleWebhookByCode(body: any) {
    const {
        code = null,
        shop_id = null,
        msg_id = null,
        partner_id = null,
        data = null,
        timestamp = null,
    } = body;
    console.log("🔥🔥🔥🔥🔥🔥🔥", { body })
    // 1. Simpan raw push dulu ke WebhookLog
    await prisma.webhookLog.create({
        data: {
            code,
            timestamp: timestamp || null,
            shopId: shop_id ? shop_id : null,
            msgId: msg_id || null,
            partnerId: partner_id || null,
            data: body, // simpan JSON full
        },
    });

    // 2. Logic by code
    switch (code) {
        case 0: {
            break
        }

        // ORDER PUSH✅
        case 3: {
            const { ordersn = null, status, completed_scenario = null, update_time = null }: {
                ordersn: any, status: ShopeeStatus, completed_scenario: any, update_time: any
            } = body.data || {};
            await prisma.orderStatusLog.create({
                data: {
                    code,
                    timestamp,
                    ordersn,
                    status,
                    completed_scenario,
                    update_time,
                },
            });
            const appStatus = mapShopeeStatusToAppStatus(status);
            await prisma.order.upsert({
                where: { orderSn: ordersn },
                update: {
                    shopee_status: status,
                    app_status: appStatus
                },
                create: {
                    orderSn: ordersn,
                    shopee_status: status,
                    app_status: appStatus,
                    shopId: shop_id,
                    rawData: body.data,
                }
            })
            break;
        }

        case 4: {
            const { ordersn = null, forder_id = null, package_number = null, tracking_no = null } = body.data || {};
            await prisma.orderTrackingLog.create({
                data: {
                    code,
                    timestamp,
                    ordersn,
                    forder_id,
                    package_number,
                    tracking_no,
                },
            });
            await prisma.order.update({
                where: { orderSn: ordersn },
                data: {
                    forder_id,
                    package_number,
                    tracking_no
                },
            })
            break;
        }
        case 15: {
            const { ordersn = null, package_number = null, status = null, } = body.data || {};

            await prisma.shippingDocumentStatusLog.create({
                data: {
                    code,
                    timestamp,
                    ordersn,
                    shopId: shop_id,
                    package_number,
                    status
                },
            });

            
            break;
        }
        case 23: {
            const {
                bookingSn = null,
                bookingStatus = null,
                updateTime = null
            } = body.data || {};

            await prisma.bookingStatusPush.create({
                data: {
                    shopId: shop_id,
                    code,
                    timestamp,
                    bookingSn,
                    bookingStatus,
                    updateTime,
                },
            });
            break;
        }
        // case 24: {
        //     const {
        //         bookingSn = null,
        //         trackingNumber = null,
        //     } = body.data || {};

        //     await prisma.bookingTrackingNoPush.create({
        //         data: {
        //             shopId: shop_id,
        //             code,
        //             timestamp,
        //             bookingSn,
        //             trackingNumber,
        //         },
        //     });
        //     break;
        // }
        // case 25: {
        //     const {
        //         bookingSn = null,
        //         status = null,
        //     } = body.data || {};

        //     await prisma.bookingShippingDocumentStatusPush.create({
        //         data: {
        //             shopId: shop_id,
        //             code,
        //             timestamp,
        //             bookingSn,
        //             status
        //         },
        //     });
        //     break;
        // }
        // case 30: {
        //     const {
        //         ordersn = null,
        //         package_number = null,
        //         fulfilmentStatus = null,
        //         updateTime = null,
        //     } = body.data || {};

        //     await prisma.packageFulfilmentStatusPush.create({
        //         data: {
        //             shopId: shop_id,
        //             code,
        //             timestamp,
        //             ordersn,
        //             package_number,
        //             fulfilmentStatus,
        //             updateTime
        //         },
        //     });
        //     break;
        // }
        // case 37: {
        //     const {
        //         binding_id = null,
        //         first_mile_tracking_number = null,
        //         status = null,
        //         update_time = null,
        //     } = body.data || {};

        //     await prisma.courierDeliveryBindingStatusPush.create({
        //         data: {
        //             shopId: shop_id,
        //             code,
        //             timestamp,
        //             binding_id,
        //             first_mile_tracking_number,
        //             status,
        //             update_time
        //         },
        //     });
        //     break;
        // }
        // case 12: {
        //     const {
        //         merchant_expire_soon = null,
        //         shop_expire_soon = null,
        //         expire_before = null,
        //         page_no = null,
        //         total_page = null,
        //     } = body.data || {};

        //     await prisma.openApiAuthorizationExp.create({
        //         data: {
        //             code,
        //             timestamp,
        //             merchant_expire_soon,
        //             shop_expire_soon,
        //             expire_before,
        //             page_no,
        //             total_page
        //         },
        //     });
        //     break;
        // }
        case 1: {
            const {
                shop_id_list = null,
                merchant_id = null,
                merchant_id_list = null,
                authorize_type = null,
                extra = null,
                main_account_id = null,
                success = null,
            } = body.data || {};

            await prisma.shopAuthorizationPush.create({
                data: {
                    code,
                    timestamp,
                    shop_id,
                    shop_id_list,
                    merchant_id,
                    merchant_id_list,
                    authorize_type,
                    extra,
                    main_account_id,
                    success
                },
            });
            break;
        }
        case 2: {
            const {
                shop_id_list = null,
                merchant_id = null,
                merchant_id_list = null,
                authorize_type = null,
                extra = null,
                main_account_id = null,
                success = null,
            } = body.data || {};

            await prisma.shopAuthorizationCanceledPush.create({
                data: {
                    code,
                    timestamp,
                    shop_id,
                    shop_id_list,
                    merchant_id,
                    merchant_id_list,
                    authorize_type,
                    extra,
                    main_account_id,
                    success
                },
            });
            break;
        }

        default:
            {
                console.log(`⚠️ Code ${code} tidak ada mapping khusus`);
                throw Error("code not found")
            }
    }
}
