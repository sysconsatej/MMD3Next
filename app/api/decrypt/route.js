// app/api/decrypt/route.js
import crypto from "crypto";

export async function POST(req) {
    try {
        const { encrypted, iv } = await req.json();

        if (!encrypted || !iv) {
            return Response.json(
                { error: "Missing encrypted or iv" },
                { status: 400 }
            );
        }

        const key = Buffer.from(process.env.SECRET_KEY, "hex");

        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            key,
            Buffer.from(iv, "hex")
        );

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return Response.json({ decrypted });

    } catch (err) {
        console.error("DECRYPT ERROR:", err);

        return Response.json(
            { error: err.message || "Decryption failed" },
            { status: 500 }
        );
    }
}