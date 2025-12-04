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
        const FLOW_ID = "566af723-984b-476d-89f1-0605fcdafcf1";
        const URL = `${BASE_URL}/api/v1/run/${FLOW_ID}`;

        console.log("--- CHAT DEBUG ---");
        console.log("BASE_URL:", BASE_URL);
        console.log("Connecting to AI at:", URL);
        console.log("Payload:", JSON.stringify({ input_value: inputValue, input_type: "chat", output_type: "chat" }));

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
