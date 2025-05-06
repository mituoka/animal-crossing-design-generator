import logging
import os
from logging.handlers import RotatingFileHandler

# ログディレクトリの作成
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)


# ロガーの設定
def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # ファイルハンドラーの設定
    file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, f"{name}.log"), maxBytes=10 * 1024 * 1024, backupCount=5  # 10MB
    )
    file_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler.setFormatter(file_formatter)

    # コンソールハンドラーの設定
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(console_formatter)

    # ハンドラーの追加
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger
