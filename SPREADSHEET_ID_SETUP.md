# スプレッドシートIDの取得方法

## スプレッドシートIDとは？

スプレッドシートIDは、GoogleスプレッドシートのURLに含まれている一意の識別子です。

## 取得方法

### 1. Googleスプレッドシートを開く

ブラウザでGoogleスプレッドシートを開きます。

### 2. URLを確認する

スプレッドシートのURLは以下のような形式です：

```
https://docs.google.com/spreadsheets/d/【ここがスプレッドシートID】/edit#gid=0
```

### 3. スプレッドシートIDをコピーする

URLの `/d/` と `/edit` の間にある文字列がスプレッドシートIDです。

**例：**
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/edit#gid=0
                                    ↑
                              この部分がスプレッドシートID
```

この例の場合、スプレッドシートIDは `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p` です。

### 4. google-apps-script.jsに設定する

`google-apps-script.js`ファイルを開き、以下の行を探します：

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

`YOUR_SPREADSHEET_ID_HERE`を、コピーしたスプレッドシートIDに置き換えます：

```javascript
const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p';
```

## 注意事項

- スプレッドシートIDは長い文字列（通常30文字程度）です
- 大文字と小文字が混在している場合があります
- URLの `/d/` と `/edit` の間の部分だけをコピーしてください
- 前後のスラッシュ（`/`）は含めないでください




