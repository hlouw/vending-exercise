import { connection } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  // Cache Components prerenders a GET handler that reads no request data.
  // Stock changes with every Purchase, so wait for a real request.
  await connection();

  // Only the Coin Supply. The Cash Box is never exposed.
  return Response.json({ supply: getStore().read().supply });
}
