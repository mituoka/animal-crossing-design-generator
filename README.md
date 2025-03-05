# プロジェクト概要

どうぶつの森のマイデザインを自動生成する Web アプリ

## プロジェクト構造

```
animal-crossing-design-generator/
├── docker-compose.yml        # Dockerコンテナの設定
├── frontend/                 # Next.jsフロントエンド
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│       ├── pages/
│       ├── components/
│       └── styles/
└── backend/                  # Pythonバックエンド
    ├── Dockerfile
    ├── main.py               # FastAPIアプリケーション
    └── app/
        ├── generator/        # 画像生成モジュール
        └── utils/
```

## 使い方

1. ホーム画面で「画像からマイデザイン作成」または「テキストからマイデザイン作成」タブを選択
2. 画像をアップロードするか、テキスト説明を入力
3. サイズと色数を調整
4. 「マイデザインを生成する」ボタンをクリック
5. 生成されたデザインを確認、編集、ダウンロード

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 今後の開発予定

- 編集機能の強化
- ユーザーアカウントと保存機能
- デザインの共有機能
- 実際のゲームで読み込み可能な QR コード生成

## 貢献

問題の報告やプルリクエストは大歓迎です。大きな変更を加える前には、まず issue を開いて議論することをお勧めします。
