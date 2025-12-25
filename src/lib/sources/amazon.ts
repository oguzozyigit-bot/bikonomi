import crypto from "crypto";
import type { FetchedProduct } from "./types";

type AmzEnv = {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host: string;        // webservices.amazon.com
  region: string;      // us-east-1
  marketplace: string; // www.amazon.com
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getEnv(): AmzEnv {
  return {
    accessKey: mustEnv("AMZ_ACCESS_KEY"),
    secretKey: mustEnv("AMZ_SECRET_KEY"),
    partnerTag: mustEnv("AMZ_PARTNER_TAG"),
    host: mustEnv("AMZ_HOST"),
    region: mustEnv("AMZ_REGION"),
    marketplace: mustEnv("AMZ_MARKETPLACE"),
  };
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}
function hmac(key: Buffer | string, s: string) {
  return crypto.createHmac("sha256", key).update(s, "utf8").digest();
}
function toAmzDate(d = new Date()) {
  // 20251224T171500Z
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const HH = String(d.getUTCHours()).padStart(2, "0");
  const MM = String(d.getUTCMinutes()).padStart(2, "0");
  const SS = String(d.getUTCSeconds()).padStart(2, "0");
  const dateStamp = `${yyyy}${mm}${dd}`;
  const amzDate = `${dateStamp}T${HH}${MM}${SS}Z`;
  return { dateStamp, amzDate };
}

function extractAsinFromUrl(url: string): string | null {
  // /dp/B0XXXXXXX  or /gp/product/B0XXXXXXX  or /product/B0XXXXXXX
  const m =
    url.match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i) ||
    url.match(/\/product\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return m ? m[1].toUpperCase() : null;
}

function pickNumber(x: any): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

export async function fetchAmazon(u: URL): Promise<FetchedProduct> {
  const env = getEnv();
  const asin = extractAsinFromUrl(u.toString());
  if (!asin) {
    throw new Error("AMAZON_ASIN_NOT_FOUND: Linkten ASIN çıkarılamadı (/dp/ASIN gibi olmalı)");
  }

  const { dateStamp, amzDate } = toAmzDate();
  const service = "ProductAdvertisingAPI";
  const method = "POST";
  const canonicalUri = "/paapi5/getitems";
  const canonicalQuerystring = "";

  // İstediğimiz alanlar: Başlık, Fiyat, Para birimi, Puan, Yorum sayısı
  // Rating/ReviewCount için Amazon "CustomerReviews" resource’u genelde yeterli olur.
  const bodyObj = {
    ItemIds: [asin],
    PartnerTag: env.partnerTag,
    PartnerType: "Associates",
    Marketplace: env.marketplace,
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "CustomerReviews.StarRating",
      "CustomerReviews.Count",
    ],
  };
  const payload = JSON.stringify(bodyObj);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${env.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const payloadHash = sha256Hex(payload);

  const canonicalRequest =
    `${method}\n${canonicalUri}\n${canonicalQuerystring}\n` +
    `${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${env.region}/${service}/aws4_request`;
  const stringToSign =
    `${algorithm}\n${amzDate}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`;

  const kDate = hmac("AWS4" + env.secretKey, dateStamp);
  const kRegion = hmac(kDate, env.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  const authorizationHeader =
    `${algorithm} ` +
    `Credential=${env.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  const res = await fetch(`https://${env.host}${canonicalUri}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: env.host,
      "x-amz-date": amzDate,
      "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      Authorization: authorizationHeader,
    },
    body: payload,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AMAZON_HTTP_${res.status}: ${text.slice(0, 300)}`);
  }

  const json = JSON.parse(text);

  const item = json?.ItemsResult?.Items?.[0];
  const title = item?.ItemInfo?.Title?.DisplayValue ?? "Amazon ürün";
  const priceAmount = item?.Offers?.Listings?.[0]?.Price?.Amount;
  const currency = item?.Offers?.Listings?.[0]?.Price?.Currency ?? "USD";

  const rating = pickNumber(item?.CustomerReviews?.StarRating);
  const ratingCount = pickNumber(item?.CustomerReviews?.Count);

  return {
    source: "amazon",
    url: u.toString(),
    title,
    price: pickNumber(priceAmount),
    currency,
    rating,
    ratingCount: ratingCount == null ? null : Math.trunc(ratingCount),
  };
}
