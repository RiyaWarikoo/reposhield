import { Pinecone } from "@pinecone-database/pinecone";

let _pinecone: Pinecone | null = null;

export function getPinecone(): Pinecone {
    if (!_pinecone) {
        if (!process.env.PINECONE_DB_API_KEY) {
            throw new Error("PINECONE_DB_API_KEY environment variable is not set");
        }
        _pinecone = new Pinecone({
            apiKey: process.env.PINECONE_DB_API_KEY,
        });
    }
    return _pinecone;
}

export function getPineconeIndex() {
    return getPinecone().index("reposhield");
}
