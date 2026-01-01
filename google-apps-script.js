/**
 * Google Apps Script for Feedback Form
 * 
 * ユーザーからの意見・要望・リクエストをスプレッドシートに記録します
 * 
 * セットアップ手順:
 * 1. Googleスプレッドシートを新規作成
 * 2. スプレッドシートのIDをコピー（URLの /d/ と /edit の間の文字列）
 * 3. Google Apps Scriptエディタを開く（拡張機能 > Apps Script）
 * 4. このコードを貼り付けて保存
 * 5. SPREADSHEET_ID を実際のスプレッドシートIDに置き換え
 * 6. デプロイ > 新しいデプロイ > 種類: ウェブアプリ
 * 7. 次のユーザーとして実行: 自分
 * 8. アクセスできるユーザー: 全員
 * 9. デプロイしてURLをコピー
 * 10. .env.local に VITE_GOOGLE_SCRIPT_URL=コピーしたURL を追加
 */

function doPost(e) {
  try {
    // スプレッドシートのIDを設定（URLから取得）
    const SPREADSHEET_ID = '120tUsUlav8QNAC4XqGMaT5-5Ln4hJrFeRtr-U6XRLhQ';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // リクエストデータを取得
    const data = JSON.parse(e.postData.contents);
    
    // 意見要望シートを取得または作成
    let sheet = spreadsheet.getSheetByName('意見要望');
    if (!sheet) {
      // シートが存在しない場合は作成
      sheet = spreadsheet.insertSheet('意見要望');
      // ヘッダー行を追加
      sheet.appendRow(['タイムスタンプ', 'メールアドレス', '意見・要望', 'ユーザーエージェント']);
    }
    
    // ヘッダー行が存在しない場合は作成（既存のシートの場合）
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['タイムスタンプ', 'メールアドレス', '意見・要望', 'ユーザーエージェント']);
    }
    
    // スプレッドシートに追加
    sheet.appendRow([
      new Date(data.timestamp || new Date().toISOString()),
      data.email || '未入力',
      data.feedback || '',
      data.userAgent || ''
    ]);
    
    // 成功レスポンス（CORS対応）
    const output = ContentService.createTextOutput(JSON.stringify({ 
      success: true,
      message: 'データが正常に追加されました',
      row: sheet.getLastRow()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
      
  } catch (error) {
    // エラーレスポンス（詳細なエラー情報を含める）
    const output = ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString(),
      message: error.message || '不明なエラーが発生しました'
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// CORS対応のためのOPTIONSリクエストハンドラ
function doOptions() {
  return ContentService.createTextOutput('');
}
