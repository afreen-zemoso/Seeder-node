import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => {
	console.error("Redis error:", err);
});

client.on("connect", () => {
	console.log("Connected to Redis");
});

client.connect().catch(console.error); 

export default client;
