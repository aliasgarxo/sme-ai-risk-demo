import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const inputValue = body.message;

        // 1. DYNAMIC URL: Use Vercel Env Var or Localhost
        const BASE_URL = process.env.LANGFLOW_API_URL || "http://127.0.0.1:7860";

        // 2. NEW FLOW ID (From Hugging Face)
        const FLOW_ID = "cfd14857-b73a-4830-a6e6-f6175a0f873a";
        const URL = `${BASE_URL}/api/v1/run/${FLOW_ID}`;

        console.log("Connecting to AI at:", URL);

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
            throw new Error(`LangFlow Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
    }
}
