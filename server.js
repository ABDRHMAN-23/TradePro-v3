// TradePro Server — Express + WebSocket for cross-device sync
// npm install express compression ws dotenv
// انسخ .env.example إلى .env وضع مفتاح GEMINI_API_KEY فيه
// node server.js
try { require("dotenv").config(); } catch {}
const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(compression());
app.use(express.json({limit:"10mb"}));
app.use((req,res,next)=>{res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","GET,POST,DELETE,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");if(req.method==="OPTIONS")return res.sendStatus(200);next();});

const DATA_DIR=path.join(__dirname,"data");
const DATA_FILE=path.join(DATA_DIR,"store.json");
function readStore(){try{if(!fs.existsSync(DATA_DIR))fs.mkdirSync(DATA_DIR,{recursive:true});if(!fs.existsSync(DATA_FILE))return{};return JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));}catch{return{};}}
function writeStore(d){try{fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2));return true;}catch{return false;}}

app.get("/api/health",(req,res)=>res.json({status:"ok",time:new Date().toISOString()}));

// ── Gemini AI Proxy ──────────────────────────────────────────
// المفتاح يُقرأ فقط من متغير بيئة على السيرفر، ولا يصل للمتصفح أبداً.
// عند التشغيل: GEMINI_API_KEY=your_key_here node server.js
// أو ضعه في ملف .env (راجع .env.example المرفق)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// حد بسيط لمعدل الطلبات لكل IP لمنع إساءة الاستخدام لمفتاحك
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // دقيقة واحدة
  const maxReq = 20;
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > maxReq;
}

app.post("/api/ai/chat", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "AI not configured on server. Set GEMINI_API_KEY environment variable." });
  }
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  const { messages, systemPrompt } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const contents = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant"))
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));

    const body = {
      contents,
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: String(systemPrompt) }] } } : {}),
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      console.error("Gemini API error:", r.status, errText);
      return res.status(502).json({ error: `Gemini API error (${r.status})` });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    res.json({ text });
  } catch (e) {
    console.error("AI proxy error:", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/sync/:userId",(req,res)=>{
  const {userId}=req.params; const {data}=req.body;
  if(!userId||!data)return res.status(400).json({error:"required"});
  const store=readStore();
  store[userId]={...data,lastSaved:new Date().toISOString()};
  writeStore(store);
  broadcastToUser(userId,{type:"sync",data:store[userId]});
  res.json({status:"ok"});
});
app.get("/api/sync/:userId",(req,res)=>{
  const store=readStore(); const data=store[req.params.userId];
  if(!data)return res.json({status:"empty"});
  res.json({status:"ok",data});
});

const distDir=path.join(__dirname,"dist");
if(fs.existsSync(distDir)){
  app.use(express.static(distDir,{maxAge:"1d"}));
  app.get("*",(req,res)=>res.sendFile(path.join(distDir,"index.html")));
}else{
  app.get("/",(req,res)=>res.send(`<h1 style="font-family:sans-serif;color:#F97316;text-align:center;margin-top:100px">⚡ TradePro Server Running on port ${PORT}</h1>`));
}

const server=http.createServer(app);
const clients=new Map();
function broadcastToUser(userId,msg){
  const peers=clients.get(userId); if(!peers)return;
  const raw=JSON.stringify(msg);
  peers.forEach(ws=>{if(ws.readyState===1)ws.send(raw);});
}
try{
  const {WebSocketServer}=require("ws");
  const wss=new WebSocketServer({server});
  wss.on("connection",ws=>{
    let userId=null;
    ws.on("message",raw=>{
      try{
        const msg=JSON.parse(raw.toString());
        if(msg.type==="register"&&msg.userId){
          userId=msg.userId;
          if(!clients.has(userId))clients.set(userId,new Set());
          clients.get(userId).add(ws);
          const store=readStore();
          if(store[userId])ws.send(JSON.stringify({type:"init",data:store[userId]}));
        }
        if(msg.type==="update"&&userId&&msg.data){
          const store=readStore();
          store[userId]={...msg.data,lastSaved:new Date().toISOString()};
          writeStore(store);
          const peers=clients.get(userId)||new Set();
          peers.forEach(p=>{if(p!==ws&&p.readyState===1)p.send(JSON.stringify({type:"sync",data:store[userId]}));});
        }
      }catch{}
    });
    ws.on("close",()=>{if(userId&&clients.has(userId))clients.get(userId).delete(ws);});
  });
  console.log("✅ WebSocket enabled");
}catch{console.log("⚠️ run: npm install ws");}

server.listen(PORT,"0.0.0.0",()=>{
  const os=require("os");
  const ip=Object.values(os.networkInterfaces()).flat().find(n=>n.family==="IPv4"&&!n.internal)?.address||"localhost";
  console.log(`\n⚡ TradePro Server\nLocal: http://localhost:${PORT}\nNetwork: http://${ip}:${PORT}\n`);
});
