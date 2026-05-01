# lesson130: IndexedDB 入門

## ゴール

- IndexedDB が `localStorage` と何が違うか説明できる
- 生 API の用語（database / objectStore / transaction / cursor）を読める
- `idb` ライブラリで Promise ベースの最小コードを書ける
- `Dexie.js` のクラス指向 API の利点を理解する
- ユースケース（オフライン作業 / 大量データキャッシュ）を判断できる

## 解説

### `localStorage` の限界

「Web Storage で値をブラウザに保存する」で扱った Web Storage（`localStorage` / `sessionStorage`）には、次の制約があります。

- **容量が小さい**（オリジン全体で 5〜10MB）
- **値は文字列だけ**（オブジェクトは JSON 化が必要）
- **同期 API**（読み書きで UI が止まる）
- **検索 / インデックスがない**
- **トランザクションがない**

「**オフラインで作業 + 復帰時に同期**」のような **本格的な** クライアント側ストレージには弱い。

### IndexedDB とは

ブラウザに組み込まれた **NoSQL のキー / バリュー DB**。

- **容量は数十 MB 〜 GB クラス**（ブラウザによる）
- **オブジェクトをそのまま** 保存（structured clone）
- **完全に非同期**（イベント / Promise）
- **インデックスでの検索** が可能
- **トランザクション** でアトミック操作
- **Service Worker からも使える**

### 用語

| 用語 | 意味 |
|---|---|
| **Database** | 1 つの DB。複数の objectStore を持つ |
| **Object Store** | テーブル / コレクションに相当 |
| **Key Path** | レコードの主キーフィールド（`id` 等） |
| **Index** | 検索を速くする補助インデックス |
| **Transaction** | 読み書きをまとめる単位（`readonly` / `readwrite`） |
| **Cursor** | 範囲走査するイテレータ |

### 生 API の最小例

```js
const open = indexedDB.open("my-db", 1);

open.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore("posts", { keyPath: "id" });
  store.createIndex("by-author", "author");
};

open.onsuccess = (event) => {
  const db = event.target.result;

  const tx = db.transaction("posts", "readwrite");
  const store = tx.objectStore("posts");
  store.put({ id: "1", title: "Hello", author: "Alice" });

  tx.oncomplete = () => console.log("保存完了");
};
```

ポイント:

- `open` の **`onupgradeneeded`** でスキーマを定義（version を上げると再実行）
- `transaction(name, mode)` で操作する store を選ぶ
- `put` / `get` / `delete` / `getAll` などのメソッドはイベントハンドラで結果を受ける

**生 API は冗長で書きづらい** ので、ラッパーを使うのが普通です。

### `idb`（Promise ラッパー）

[`idb`](https://github.com/jakearchibald/idb)（Jake Archibald 製）は **生 API を Promise 化** した薄いラッパー。

```bash
npm install idb
```

```ts
import { openDB, DBSchema } from "idb";

interface MyDB extends DBSchema {
  posts: {
    key: string;
    value: { id: string; title: string; author: string };
    indexes: { "by-author": string };
  };
}

const db = await openDB<MyDB>("my-db", 1, {
  upgrade(db) {
    const store = db.createObjectStore("posts", { keyPath: "id" });
    store.createIndex("by-author", "author");
  },
});

await db.put("posts", { id: "1", title: "Hello", author: "Alice" });
const post = await db.get("posts", "1");
const byAlice = await db.getAllFromIndex("posts", "by-author", "Alice");
```

`DBSchema` を使うと **型付きの API** になり、IDE 補完が効きます。

### `Dexie.js`（クラス指向）

[Dexie.js](https://dexie.org/) は IndexedDB を **「JS の DB」っぽく書ける** ライブラリ。クエリの書き味が SQL に近い。

```bash
npm install dexie
```

```ts
import Dexie, { Table } from "dexie";

interface Post {
  id?: number;
  title: string;
  author: string;
  createdAt: number;
}

class MyDB extends Dexie {
  posts!: Table<Post, number>;
  constructor() {
    super("my-db");
    this.version(1).stores({
      posts: "++id, author, createdAt",
    });
  }
}

const db = new MyDB();

await db.posts.add({ title: "Hello", author: "Alice", createdAt: Date.now() });

const aliceLatest = await db.posts
  .where("author").equals("Alice")
  .reverse()
  .sortBy("createdAt");
```

ポイント:

- `++id` は **自動採番** の主キー
- `stores` の文字列で **インデックスを宣言**
- `where().equals().reverse().sortBy()` のような **チェーン** が書ける
- React 用 hooks（`useLiveQuery`）も提供される

```tsx
import { useLiveQuery } from "dexie-react-hooks";

function PostList() {
  const posts = useLiveQuery(() => db.posts.toArray(), []);
  return (
    <ul>
      {posts?.map((p) => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}
```

`useLiveQuery` は DB の変更を **監視** して自動再描画。state 管理が簡単になります。

### `localStorage` / `sessionStorage` / IndexedDB の使い分け

| 用途 | 推奨 |
|---|---|
| ユーザー設定（ダークモード / 言語） | `localStorage` |
| タブ単位の一時状態 | `sessionStorage` |
| 認証トークン | **どちらも使わない**。HttpOnly Cookie に |
| Todo / 下書き / オフライン編集データ | **IndexedDB** |
| 画像 / 動画 / Blob | **IndexedDB**（Cache API も候補） |
| API レスポンスのキャッシュ | **IndexedDB** + Service Worker |
| ゲーム / ノートアプリの完全オフライン | **IndexedDB** |

「**容量大 / 非同期 / 構造化 / 検索**」が要るなら IndexedDB、それ以外は `localStorage` で十分。

### 容量とクォータ

ブラウザは「**クォータ**」というオリジン単位の上限を割り当てます。`navigator.storage.estimate()` で確認できます。

```js
const { quota, usage } = await navigator.storage.estimate();
console.log(`使用 ${usage} / クォータ ${quota}`);
```

ChromeBook / iOS / 容量不足時に **自動退去**（eviction）されることがあります。**消えても困らない設計** にする / `navigator.storage.persist()` で **退去耐性** をリクエスト:

```js
const granted = await navigator.storage.persist();
if (granted) console.log("永続化 OK");
```

ただしユーザーの Bookmark / インストール等の条件次第。

### `Cache API` との違い

Service Worker と一緒に出てくる **`Cache API`**（「Service Worker と PWA 深掘り」）と IndexedDB は **別物**:

| | Cache API | IndexedDB |
|---|---|---|
| 単位 | Request / Response | 任意のオブジェクト |
| 用途 | HTTP リソースの保存 | アプリのデータ保存 |
| クエリ | URL マッチ | インデックス検索 |
| トランザクション | なし | あり |

「画像や HTML を保存 → Cache API」、「ユーザーが編集中の下書き → IndexedDB」と覚えればよいです。

### IndexedDB のオフライン同期パターン

```
[ユーザー操作] → IndexedDB に保存（pending）
                       ↓
              [ネットがある時]
                       ↓
              バックエンドに POST
                       ↓
            成功したら IndexedDB のフラグを更新
```

- 書き込みは **常にローカルに保存**（UI が即座に反応）
- バックグラウンドで **サーバー同期**（Background Sync / 起動時にチェック）
- 競合があれば **最終書き込み勝ち** / **マージ** / **CRDT**（Yjs / Automerge）

ノートアプリ / Todo アプリ / メーラーで定番のパターン。

### よくある罠

- **transaction が auto-commit する**: `await` を別の Promise で挟むと **トランザクションが終わってしまう**。同じ tx の中ではすべての操作を **同期的に並べる**
- **構造化クローンの制約**: 関数 / シンボル / DOM ノードは保存できない
- **大量レコード**: `cursor` で逐次処理する。`getAll()` でメモリ爆発に注意
- **iOS Safari**: 古いバージョンで挙動が不安定。最新版（17 / 18 系）はかなり改善
- **マイグレーション**: `version` を上げて `upgrade` 内で `objectStoreNames` をチェックして差分を当てる

## 演習

### ゴール

- Dexie.js で **オフラインメモアプリ** を作る
- `localStorage` 比較で「容量 / 非同期 / 検索」の差を体感する

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest indexeddb-sample -- --template react-ts
cd indexeddb-sample
npm install
npm install dexie dexie-react-hooks
```

### 手順 2: DB の定義

`src/db.ts`:

```ts
import Dexie, { Table } from "dexie";

export interface Memo {
  id?: number;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

class MemoDB extends Dexie {
  memos!: Table<Memo, number>;
  constructor() {
    super("memo-app");
    this.version(1).stores({
      memos: "++id, updatedAt",
    });
  }
}

export const db = new MemoDB();
```

### 手順 3: メモ一覧 + 追加

`src/App.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Memo } from "./db";

export default function App() {
  const memos = useLiveQuery(
    () => db.memos.orderBy("updatedAt").reverse().toArray(),
    [],
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const add = async () => {
    if (!title.trim()) return;
    await db.memos.add({
      title,
      body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setTitle("");
    setBody("");
  };

  const remove = (id: number) => db.memos.delete(id);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>オフラインメモ</h1>
      <div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="本文" />
        <button onClick={add}>追加</button>
      </div>
      <ul>
        {memos?.map((m) => (
          <li key={m.id}>
            <strong>{m.title}</strong> — {new Date(m.updatedAt).toLocaleString()}
            <p>{m.body}</p>
            <button onClick={() => remove(m.id!)}>削除</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### 手順 4: 確認

```bash
npm run dev
```

メモを追加し、**ブラウザを閉じて再度開いて** も残っていることを確認。DevTools の Application → IndexedDB → `memo-app` → `memos` で実データが見られる。

### 手順 5: ストレージ使用量を表示

`App` 末尾に追加:

```tsx
import { useEffect, useState } from "react";

const [usage, setUsage] = useState("");
useEffect(() => {
  navigator.storage.estimate().then(({ usage, quota }) => {
    setUsage(`使用 ${Math.round((usage ?? 0) / 1024)}KB / クォータ ${Math.round((quota ?? 0) / 1024 / 1024)}MB`);
  });
}, [memos]);
```

`<p>{usage}</p>` を画面に出す。メモを増やすと使用量が増えていくのが見えます。

### 期待出力

- メモがブラウザを閉じても残る
- `Application → IndexedDB` でストアの中身が見られる
- ストレージ使用量が表示され、メモ追加で増える

### 変える

- `useLiveQuery(() => db.memos.where("title").startsWithIgnoreCase("a").toArray())` のような **検索** を追加
- DB の `version(2)` で `body` にインデックスを追加し、マイグレーション挙動を観察
- 大量データ（1 万件）を一括追加して **`getAll` の遅さ** と **`each` cursor の差** を比較

### 自分で書く（任意）

- API と同期する Memo アプリを作る（**ローカルに保存 → サーバーに同期**）
- 画像（Blob）を添付できるようにする
- `localStorage` から IndexedDB に乗り換えるマイグレーションスクリプトを書く

## まとめ

- `localStorage` の限界（容量小 / 文字列のみ / 同期 / 検索なし）を超える **クライアント DB** が IndexedDB
- 用語: **database / objectStore / transaction / cursor**
- 生 API は冗長 → **`idb`**（薄いラッパー） か **`Dexie.js`**（クラス指向） を使う
- React なら **`dexie-react-hooks`** の `useLiveQuery` で自動再描画
- 「ユーザー設定 → localStorage」「アプリのデータ → IndexedDB」「HTTP リソース → Cache API」の使い分け
- クォータ / 退去 / `navigator.storage.persist()` を意識する
- オフライン同期は「**ローカル即保存** + バックグラウンド同期」が定番
