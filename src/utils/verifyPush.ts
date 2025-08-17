import * as crypto from 'crypto';

/**
 * Memverifikasi signature dari Shopee webhook.
 * @param url - URL lengkap dari request yang masuk.
 * @param requestBody - String dari raw request body (bukan JSON yang sudah di-parse).
 * @param partnerKey - Kunci partner (secret key) Anda.
 * @param authorization - Nilai signature dari header Authorization.
 * @returns boolean - True jika signature valid, false jika tidak.
 */
export function verifyPushMsg(
  url: string,
  requestBody: string,
  partnerKey: string,
  authorization: string
): boolean {
  const baseStr = url + "|" + requestBody;

  const hmac = crypto.createHmac("sha256", partnerKey);
  hmac.update(baseStr, "utf8");

  const calAuth = hmac.digest("hex");

  // console.log({ calAuth, authorization })
  return calAuth === authorization;
}