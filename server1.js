const WebSocket = require('ws');

// ここが魔法のコードです！
// "process.env.PORT" はRenderが決めた番号、それがなければ "10000" を使え、という意味です
const port = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: port });

wss.on('listening', () => {
    console.log('サーバーが起動しました！ポート:' + port);
});

wss.on('connection', (ws) => {
    console.log('誰かが接続しました！');
});

let players = new Map(); // プレイヤー情報
let currentCourse = "default"; // 現在のコース

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // BANチェック
        if (players.has(ws) && players.get(ws).banned) return;

        switch (data.type) {
            case 'JOIN':
                players.set(ws, { id: data.id, name: data.name, x: 0, y: 0, banned: false });
                break;
            case 'MOVE':
                if (players.has(ws)) {
                    let p = players.get(ws);
                    p.x = data.x; p.y = data.y;
                }
                break;
            case 'CHAT':
                broadcast({ type: 'CHAT', name: data.name, text: data.text });
                break;
            case 'COURSE':
                currentCourse = data.courseId;
                broadcast({ type: 'COURSE_CHANGE', courseId: currentCourse });
                break;
            case 'BAN':
                // ターゲットIDを持つユーザーを探してBANする
                players.forEach((p, socket) => {
                    if (p.id === data.targetId) p.banned = true;
                });
                break;
        }
    });

    // 定期的に全プレイヤーの情報を送信（位置同期）
    setInterval(() => {
        let playerList = [];
        players.forEach(p => playerList.push(p));
        broadcast({ type: 'SYNC', players: playerList });
    }, 100);
});

function broadcast(obj) {
    wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(obj)); });
}
console.log("サーバー起動中: ws://localhost:8080");