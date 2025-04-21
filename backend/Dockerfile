FROM python:3.9-slim

WORKDIR /app

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    && rm -rf /var/lib/apt/lists/*

# PyTorchを先にインストール
RUN pip install --no-cache-dir torch==2.1.0 torchvision==0.16.0 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .

# その他の依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Faceのキャッシュディレクトリを作成
RUN mkdir -p /root/.cache/huggingface

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]