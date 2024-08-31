// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, onChildChanged, onChildRemoved }
from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";



// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let serviceType = ''; // サービスタイプを格納する変数
const dbRef = ref(db, "chat"); // "chat"という名前のチャットルームを使用

// サービス選択ボタンのクリックイベント
$("#interpretation").on("click", function() {
    serviceType = '通訳';
    startChat();
});
$("#translation").on("click", function() {
    serviceType = '翻訳';
    startChat();
});
$("#project-management").on("click", function() {
    serviceType = 'プロジェクトマネージメント';
    startChat();
});


// チャット画面の表示
function startChat() {
    $("#service-selection").hide();
    $("#chat-container").show();
    alert(`${serviceType}サービスが選択されました。`);
}

// メッセージの送信処理
$("#send").on("click", function() {
    const uname = $("#uname").val();
    const text = $("#text").val();
    
    if (uname && text) {
        const msg = {
            uname: uname,
            text: text,
            service: serviceType,
            timestamp: Date.now()
        };
        const newPostRef = push(dbRef); // 新しいメッセージをチャットにプッシュ
        set(newPostRef, msg); // メッセージをFirebaseに保存
        $("#text").val(""); // メッセージ入力フィールドをクリア
    }
});

// 新しいメッセージが追加されたときにチャット画面に表示
onChildAdded(dbRef, function(data) {
    const msg = data.val(); // データベースからメッセージを取得
    const key = data.key; // メッセージのユニークキーを取得

    // メッセージのHTMLを作成
    let h = `<div class="message message-received" id="${key}">`;
    h += `<strong>${msg.uname}</strong> (${msg.service})<br>`;
    h += `<span>${msg.text}</span><br>`;
    h += `<small>${new Date(msg.timestamp).toLocaleString()}</small>`;
    h += `<button onclick="editMessage('${key}')">編集</button>`;
    h += `<button onclick="deleteMessage('${key}')">削除</button>`;
    h += `</div>`;
    
    $("#output").append(h);
    $("#output").scrollTop($("#output")[0].scrollHeight); // 自動スクロール
});

// メッセージが変更されたときの処理
onChildChanged(dbRef, function(data) {
    const msg = data.val();
    const key = data.key;

    $(`#${key}`).html(`
        <strong>${msg.uname}</strong> (${msg.service})<br>
        <span>${msg.text}</span><br>
        <small>${new Date(msg.timestamp).toLocaleString()}</small>
        <button onclick="editMessage('${key}')">編集</button>
        <button onclick="deleteMessage('${key}')">削除</button>
    `);
});

// メッセージが削除されたときの処理
onChildRemoved(dbRef, function(data) {
    const key = data.key;
    $(`#${key}`).remove();
});

// メッセージ編集処理
window.editMessage = function(key) {
    const newText = prompt("メッセージを編集:", $(`#${key} span`).text());
    if (newText) {
        update(ref(db, `chat/${key}`), { text: newText, timestamp: Date.now() });
    }
};

// メッセージ削除処理
window.deleteMessage = function(key) {
    if (confirm("このメッセージを削除しますか？")) {
        remove(ref(db, `chat/${key}`));
    }
};
