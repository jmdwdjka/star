const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    console.log('--- 接続されました！ ---');
    
ws.on('message', (data) => {
    try {
        const json = JSON.parse(data.toString());
        
        // typeがMOVEのときだけログに出す
        if (json.type === 'MOVE') {
            console.log('プレイヤー位置更新 -> X:' + json.x + ', Y:' + json.y);
        }
    } catch (e) {
        console.log('JSON形式じゃないデータが来たよ');
    }
});
