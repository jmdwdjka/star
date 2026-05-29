const WebSocket = require('ws');
// ここを修正：Renderが指定するポートを優先する
const port = process.env.PORT || 8080; 
const wss = new WebSocket.Server({ port: port });

wss.on('connection', (ws) => {
    console.log('誰かが接続しました！'); // これでログに出るはず
    ws.on('message', (message) => {
        console.log('受信:', message.toString()); // これでログに出るはず
    });
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