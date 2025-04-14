from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from typing import Optional
import uuid
import shutil
from app.generator.pixel_generator import generate_pixel_art
from pydantic import BaseModel
import base64
from io import BytesIO
import requests
import json

app = FastAPI(title="Animal Crossing Design Generator API")

# CORSの設定
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 一時ファイル保存用のディレクトリ
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")

# ディレクトリが存在しない場合は作成
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

class DesignOptions(BaseModel):
    size: int = 32  # Animal Crossingのデザインサイズ（通常は32x32）
    palette_size: int = 15  # 使用する色数（Animal Crossingは最大15色）
    style: str = "pixel"  # 変換スタイル

@app.get("/")
def read_root():
    return {"message": "Welcome to Animal Crossing Design Generator API"}

@app.post("/generate/from-image")
async def generate_from_image(
    file: UploadFile = File(...),
    size: int = Form(32),
    palette_size: int = Form(15),
    style: str = Form("pixel")
):
    # アップロードされたファイルの検証
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    
    # 一時ファイルに保存
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # ピクセルアート生成
        output_path = os.path.join(OUTPUT_DIR, f"{file_id}_output.png")
        design_data = generate_pixel_art(
            input_path=file_path,
            output_path=output_path,
            size=size,
            palette_size=palette_size,
            style=style
        )
        
        # Base64エンコードされた画像データを返す
        with open(output_path, "rb") as img_file:
            img_data = img_file.read()
            base64_img = base64.b64encode(img_data).decode("utf-8")
        
        return {
            "success": True,
            "design_id": file_id,
            "image": f"data:image/png;base64,{base64_img}",
            "design_data": design_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating design: {str(e)}")
    
    finally:
        # 一時ファイルの削除（必要に応じて）
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/generate/similar-image")
async def generate_similar_image(
    file: UploadFile = File(...),
    size: int = Form(32),
    palette_size: int = Form(15),
    style: str = Form("pixel")
):
    # アップロードされたファイルの検証
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    
    # 一時ファイルに保存
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 画像をBase64エンコード
        with open(file_path, "rb") as img_file:
            img_data = img_file.read()
            base64_img = base64.b64encode(img_data).decode("utf-8")
        
        # Stability AI APIを使用して類似画像を生成
        # 注意: 実際のAPIキーは環境変数から取得するべきです
        api_key = os.getenv("STABILITY_API_KEY", "your-api-key-here")
        
        # APIリクエストの準備
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        # 画像生成のプロンプトを作成
        prompt = "Animal Crossing style pixel art, cute, colorful, simple design"
        
        # APIリクエストのボディ
        body = {
            "text_prompts": [{"text": prompt}],
            "cfg_scale": 7,
            "height": 512,
            "width": 512,
            "samples": 1,
            "steps": 30,
            "style_preset": "pixel-art"
        }
        
        # APIリクエストの送信
        response = requests.post(
            "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
            headers=headers,
            json=body
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Error from AI API: {response.text}")
        
        # レスポンスの解析
        response_data = response.json()
        
        # 生成された画像を取得
        generated_image_data = response_data["artifacts"][0]["base64"]
        
        # Base64デコードして画像を保存
        generated_image_bytes = base64.b64decode(generated_image_data)
        generated_image_path = os.path.join(UPLOAD_DIR, f"{file_id}_generated.png")
        
        with open(generated_image_path, "wb") as img_file:
            img_file.write(generated_image_bytes)
        
        # 生成された画像からピクセルアートを生成
        output_path = os.path.join(OUTPUT_DIR, f"{file_id}_output.png")
        design_data = generate_pixel_art(
            input_path=generated_image_path,
            output_path=output_path,
            size=size,
            palette_size=palette_size,
            style=style
        )
        
        # 生成されたピクセルアートをBase64エンコード
        with open(output_path, "rb") as img_file:
            img_data = img_file.read()
            base64_output = base64.b64encode(img_data).decode("utf-8")
        
        return {
            "success": True,
            "design_id": file_id,
            "original_image": f"data:image/png;base64,{base64_img}",
            "generated_image": f"data:image/png;base64,{generated_image_data}",
            "pixel_art": f"data:image/png;base64,{base64_output}",
            "design_data": design_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating similar image: {str(e)}")
    
    finally:
        # 一時ファイルの削除
        if os.path.exists(file_path):
            os.remove(file_path)
        if 'generated_image_path' in locals() and os.path.exists(generated_image_path):
            os.remove(generated_image_path)

@app.post("/generate/from-text")
async def generate_from_text(prompt: str = Form(...), options: DesignOptions = None):
    if options is None:
        options = DesignOptions()
    
    try:
        # 一意のIDを生成
        design_id = str(uuid.uuid4())
        output_path = os.path.join(OUTPUT_DIR, f"{design_id}_output.png")
        
        # テキストプロンプトからピクセルアートを生成
        # 注: この機能は外部AIサービスを使うか、独自のモデルを実装する必要があります
        design_data = generate_pixel_art(
            input_text=prompt,
            output_path=output_path,
            size=options.size,
            palette_size=options.palette_size,
            style=options.style
        )
        
        # Base64エンコードされた画像データを返す
        with open(output_path, "rb") as img_file:
            img_data = img_file.read()
            base64_img = base64.b64encode(img_data).decode("utf-8")
        
        return {
            "success": True,
            "design_id": design_id,
            "image": f"data:image/png;base64,{base64_img}",
            "design_data": design_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating design: {str(e)}")

@app.get("/designs/{design_id}")
async def get_design(design_id: str):
    output_path = os.path.join(OUTPUT_DIR, f"{design_id}_output.png")
    
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Design not found")
    
    return FileResponse(output_path)