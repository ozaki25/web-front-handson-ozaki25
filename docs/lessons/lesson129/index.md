# lesson129: WebSocket と Server-Sent Events（SSE）

## ゴール

- リアルタイム通信の **選択肢** を整理して語れる
- WebSocket と SSE の **使い分け** を判断できる
- WebSocket クライアントの最小実装が書ける
- SSE クライアント（`EventSource`）の最小実装が書ける
- Next.js / 各サービス（Pusher / Ably / Supabase Realtime）の位置付けを把握する

## 解説

### リアルタイム通信の選択肢

「サーバーから **押し付けで** データを送りたい」場面の主な選択肢:

| 方式 | 通信方向 | 用途 |
|---|---|---|
| **ポーリング** | クライアント → サーバー（定期） | 単純だが効率悪い |
| **ロングポーリング** | クライアント → サーバー（待機） | レガシー互換 |
| **Server-Sent Events**（SSE） | サーバー → クライアントの **一方向** | 通知 / 株価 / AI ストリーム |
| **WebSocket** | **双方向** | チャット / オンラインゲーム / 共同編集 |
| **WebTransport** | UDP ベースの双方向（HTTP/3） | 低遅延が要る場面（実験的） |

通信が双方向か単方向か、また HTTP の上で済むかどうかを軸にして選びます。

### Server-Sent Events（SSE）

「サーバーから **テキストイベントをストリーム** で送る」HTTP ベースの仕組み。

#### サーバー側

レスポンスのヘッダを `Content-Type: text/event-stream` にし、本文を **特別なフォーマット** で書き続けます。

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: hello

data: world

event: chat
data: {"user":"alice","msg":"こんにちは"}
```

各イベントは **空行** で区切る。`data:` 以外に `event:`（イベント名）/ `id:`（ID）/ `retry:`（再接続秒）が指定可能。

#### クライアント側

```js
const es = new EventSource("/api/stream");

es.onmessage = (e) => {
  console.log("受信:", e.data);
};

es.addEventListener("chat", (e) => {
  console.log("chat:", JSON.parse(e.data));
});

es.onerror = (err) => {
  console.error("エラー or 切断:", err);
};
```

`EventSource` は:

- **自動再接続**（切れても勝手につなぎ直す）
- `id:` を覚えていて再接続時に `Last-Event-ID` ヘッダで送る
- ブラウザ標準（IE 以外）でライブラリ不要

#### Next.js での実装（Route Handler + ReadableStream）

```ts
// app/api/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let count = 0;
      const id = setInterval(() => {
        count++;
        controller.enqueue(encoder.encode(`data: tick ${count}\n\n`));
        if (count >= 10) {
          clearInterval(id);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
```

::: tip AI ストリーミングと SSE
ChatGPT のような **トークン単位の応答** にも SSE / `Streaming Responses` が広く使われています。Vercel の AI SDK / Anthropic の Stream / OpenAI Stream など、SaaS の SDK が SSE を内部で扱っています。
:::

### WebSocket

「**双方向**、**バイナリも送れる**、**HTTP からアップグレード** して始まる」プロトコル（`ws://` / `wss://`）。

#### サーバー側（ws ライブラリ）

```bash
npm install ws
```

```js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (socket) => {
  console.log("接続");
  socket.on("message", (data) => {
    // 全クライアントにブロードキャスト
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(data.toString());
      }
    }
  });
});
```

#### クライアント側

```js
const ws = new WebSocket("ws://localhost:4000");

ws.addEventListener("open", () => {
  console.log("接続成功");
  ws.send("hello");
});

ws.addEventListener("message", (e) => {
  console.log("受信:", e.data);
});

ws.addEventListener("close", () => {
  console.log("切断");
});
```

#### バイナリも送れる

```js
const buffer = new Uint8Array([1, 2, 3, 4]);
ws.binaryType = "arraybuffer";
ws.send(buffer);
```

ゲーム / VoIP / ファイル転送など、テキストでは厳しい用途に向いています。

### 切断と再接続

WebSocket は **自動再接続しない**。ネットワーク切断 / サーバー再起動で `close` イベントが飛びます。実装側で再接続を:

```js
function connect() {
  const ws = new WebSocket(url);
  ws.addEventListener("close", () => {
    setTimeout(connect, 1000); // 1 秒後に再接続
  });
  return ws;
}
```

実用では **指数バックオフ + 上限** にします（`socket.io` などのライブラリが内部で実装）。

### SSE と WebSocket の使い分け

| 観点 | SSE | WebSocket |
|---|---|---|
| 通信方向 | サーバー → クライアント（一方向） | 双方向 |
| プロトコル | HTTP（追加設定不要） | 専用（プロキシ調整が必要） |
| 自動再接続 | あり | なし（自前で実装） |
| ブラウザサポート | 全主要 | 全主要 |
| バイナリ | 不可 | 可 |
| プッシュレート | 低〜中 | 低〜高 |

#### 選び方の指針

- **通知 / ストック価格 / AI ストリーム / ライブニュース**: SSE で十分
- **チャット / 共同編集 / リアルタイムゲーム / カーソル位置共有**: WebSocket
- **「通知だけ」+ 既存 HTTP インフラを活かしたい**: SSE が楽

### React / Next.js で扱う

#### React Hook で WebSocket

```tsx
import { useEffect, useState } from "react";

export function useWebSocket(url: string) {
  const [messages, setMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socket.addEventListener("message", (e) => {
      setMessages((m) => [...m, e.data]);
    });
    setWs(socket);
    return () => socket.close();
  }, [url]);

  const send = (msg: string) => ws?.send(msg);
  return { messages, send };
}
```

`useEffect` のクリーンアップで **必ず close** すること。React 19 / Strict Mode で **2 度マウント** されて接続が漏れる事故を防げます。

#### Next.js の Route Handler で WebSocket を持つときの注意

Next.js の Route Handler は **Node.js Runtime / Edge Runtime** の 2 種類があり、`export const runtime` で切り替えられます。WebSocket をホストできるかは Runtime とデプロイ先で大きく変わります。

- **Edge Runtime (Vercel Edge)**: WebSocket サーバー側はホストできない。SSE の配信は OK
- **Cloudflare Workers**: 単体の Worker でも `WebSocketPair` で WebSocket Upgrade を受け付けられる（接続待機中は CPU を消費しない）。複数接続の協調（チャットルームなど）が必要なら **Durable Objects** で 1 部屋 = 1 オブジェクトのステートフル構成にする
- **Node.js Runtime + 通常の Node プロセス**（`next start` 等）: 実験的な「Route Handler の WebSocket Upgrade」サポートが入りつつあるが、Vercel の **サーバーレス関数では長時間接続を保てない** ため実運用は不向き
- **WebSocket 本格運用**: 別途 **専用の Node サーバー**（`server.ts` / 別サービス）、**PartyKit / Cloudflare Durable Objects**、**Pusher / Ably / Supabase Realtime** の SaaS が現実解

SSE（一方向ストリーミング）は Vercel の Route Handler でも動きますが、Edge / Node どちらでも **接続時間の上限** に注意します（Vercel Hobby は 10〜60 秒程度）。

### マネージドサービス

「自前で WebSocket サーバーを書く」のは接続管理 / スケーリング / 切断検知が大変。次のサービスが定番:

| サービス | 特徴 |
|---|---|
| **Pusher** | リアルタイム通信の老舗。チャンネル / イベントが分かりやすい |
| **Ably** | エンタープライズ。再生 / 履歴 / メッセージ TTL |
| **Supabase Realtime** | DB 変更 → クライアント通知が標準。Postgres 連携 |
| **PartyKit** | エッジでの WebSocket / Durable Objects ベース |
| **Liveblocks** | Figma / Notion 風の共同編集 UI ライブラリ |
| **Cloudflare Durable Objects** | エッジで状態を持つ WebSocket。1 部屋 = 1 オブジェクト |

自前で WebSocket を実装する前に、これらのサービスで済まないかを先に確認するのが現代の判断軸になっています。

### Socket.IO の現在地

長らく WebSocket のデファクトだった `socket.io` は、**2026 年も使えます** が、ブラウザの素の WebSocket / SSE が成熟したので **新規プロジェクトでは選ばない** ケースが増えています。古い案件、Node.js のサーバー起動が確実な場合、低レベルな再接続をライブラリに任せたい場合などに採用を検討します。

### よくある罠

- **`new EventSource(url)` の URL に Cookie を付けたい** → `withCredentials: true` を渡す。サーバーは CORS を通す
- **WebSocket がプロキシ越しに切れる** → リバースプロキシで `Upgrade` / `Connection` ヘッダのフォワード設定
- **アイドルタイムアウト**（CDN や LB が 60 秒で切る）→ **ハートビート**（Ping）を 30 秒ごとに送る
- **`wss://`（HTTPS）を使う**（HTTP/2 のメリット + Mixed Content 対策）

## 演習

### ゴール

- SSE と WebSocket をそれぞれ Next.js プロジェクトで触る

### 手順 1: 新規 Next.js

```bash
npx create-next-app@latest realtime-sample --ts --app
cd realtime-sample
```

### 手順 2: SSE のサーバーとクライアント

`app/api/clock/route.ts`:

```ts
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const id = setInterval(() => {
        const time = new Date().toISOString();
        controller.enqueue(encoder.encode(`data: ${time}\n\n`));
      }, 1000);
      // 30 秒で終了
      setTimeout(() => {
        clearInterval(id);
        controller.close();
      }, 30000);
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

`app/clock/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState("...");
  useEffect(() => {
    const es = new EventSource("/api/clock");
    es.onmessage = (e) => setTime(e.data);
    return () => es.close();
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h1>SSE 時計</h1>
      <p>{time}</p>
    </main>
  );
}
```

`npm run dev` で `/clock` を開くと、毎秒時刻が更新されます。

### 手順 3: WebSocket チャットの最小サーバー

別ディレクトリで:

```bash
mkdir ws-server && cd ws-server
npm init -y
npm pkg set type=module
npm install ws
```

`server.js`:

```js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    for (const c of wss.clients) {
      if (c.readyState === c.OPEN) c.send(data.toString());
    }
  });
});

console.log("ws://localhost:4000");
```

```bash
node server.js
```

### 手順 4: チャットクライアント

Next.js の `app/chat/page.tsx`:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.addEventListener("message", (e) => {
      setMessages((m) => [...m, e.data]);
    });
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    wsRef.current?.send(text);
    setText("");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>WebSocket チャット</h1>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      <form onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button>送信</button>
      </form>
    </main>
  );
}
```

ブラウザを 2 つ開いて `http://localhost:3000/chat` にアクセスし、片方で送信したメッセージがもう片方に届くことを確認。

### 期待出力

- `/clock` で 1 秒ごとに時刻が更新される
- `/chat` で 2 つのブラウザの間でリアルタイムにメッセージが共有される

### 変える

- SSE で `event: tick` / `event: alert` の **イベント名付きメッセージ** を送って、クライアントの `addEventListener` で受け分ける
- WebSocket チャットに **ユーザー名** を持たせ、JSON で送受信する
- 切断検知 + 再接続のロジックを追加

### 自分で書く（任意）

- AI ストリーミング: SSE で 1 文字ずつ送るデモを作る
- Pusher / Ably / Supabase Realtime のいずれかを使って **SaaS で同じチャット** を実装し、自前との比較
- PartyKit を試して、エッジで WebSocket を動かす

## まとめ

- リアルタイム通信は **ポーリング / SSE / WebSocket / WebTransport** から選ぶ
- **SSE** はサーバー → クライアントの一方向。HTTP の上で動き、`EventSource` で扱う
- **WebSocket** は双方向。バイナリも送れるが、自動再接続は自前
- AI ストリーミングは **SSE** が定番
- Vercel の **Edge Runtime は WebSocket をホストできない**。SaaS / 別サーバーが必要
- マネージド: **Pusher / Ably / Supabase Realtime / PartyKit / Liveblocks**
- React の `useEffect` で **必ずクリーンアップ** で接続を閉じる
- アイドル切断対策に **ハートビート**、`wss://` を使う
