import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${STRAPI_URL}/api/${path.join("/")}${searchParams ? `?${searchParams}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Strapi" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const body = await request.json();
    const url = `${STRAPI_URL}/api/${path.join("/")}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to post to Strapi" },
      { status: 500 }
    );
  }
}