import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const inputValue = body.message;

        // 1. DYNAMIC URL: Use Vercel Env Var or Localhost
        // IMPORTANT: LANGFLOW_API_URL should be in the format "https://username-space.hf.space"
        // Do NOT include "/api" or trailing slashes.
        const BASE_URL = process.env.LANGFLOW_API_URL || "http://127.0.0.1:7860";

        // 2. NEW FLOW ID (From Hugging Face)
        const FLOW_ID = "ef523106-c38c-43ff-b74d-b7e71ea1a602";
        const URL = `${BASE_URL}/api/v1/run/${FLOW_ID}`;

        console.log("--- CHAT DEBUG ---");
        console.log("BASE_URL:", BASE_URL);
        console.log("Connecting to AI at:", URL);
        console.log("Payload:", JSON.stringify({ input_value: inputValue, input_type: "chat", output_type: "chat" }));

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add Authorization token if present (for Private Spaces)
        if (process.env.HF_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
        }

        const response = await fetch(URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                input_value: inputValue,
                input_type: "chat",
                output_type: "chat",
                session_id: crypto.randomUUID()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("LangFlow API Error:", response.status, errorText);
            throw new Error(`LangFlow Error: ${response.status} ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            const html = await response.text();
            console.error("Received HTML from LangFlow:", html.substring(0, 200)); // Log first 200 chars
            throw new Error("Received HTML instead of JSON. The URL might be wrong, or the Space is private/building.");
        }

        const data = await response.json();
        console.log("LangFlow Response Success");
        return NextResponse.json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        // @ts-ignore
        if (error.cause) console.error("Error Cause:", error.cause);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Failed to connect to AI"
        }, { status: 500 });
    }
}
