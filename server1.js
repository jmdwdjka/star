const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    console.log('--- 接続されました！ ---');
    
    ws.on('message', (data) => {
        const msg = data.toString();
        console.log('受信データ:', msg);
        
        // サーバーが受け取ったことを返信（TurboWarp側で確認するため）
        ws.send('サーバーで受け取りました: ' + msg);
    });
});