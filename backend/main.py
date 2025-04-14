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
import io
from PIL import Image
from app.ml.design_generator import DesignGenerator
from app.core.logger import setup_logger

# ロガーの設定
logger = setup_logger("app")

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

# 画像生成モデルのインスタンスを作成
generator = DesignGenerator()

class DesignOptions(BaseModel):
    size: int = 32  # Animal Crossingのデザインサイズ（通常は32x32）
    palette_size: int = 15  # 使用する色数（Animal Crossingは最大15色）
    style: str = "pixel"  # 変換スタイル

@app.get("/")
def read_root():
    return {"message": "Welcome to Animal Crossing Design Generator API"}

def image_to_base64(image: Image.Image) -> str:
    """PIL Imageをbase64文字列に変換"""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@app.post("/api/generate/from-image")
async def generate_from_image(file: UploadFile = File(...)):
    """画像から類似のマイデザインを生成"""
    try:
        logger.info(f"画像生成リクエストを受信: {file.filename}")
        
        # アップロードされた画像を読み込み
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # 一時ファイルのパスを設定
        temp_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}.png")
        
        try:
            # 一時的にファイルに保存
            input_image.save(temp_path)
            
            # 画像生成
            logger.info("画像生成を開始")
            generated_image = generator.generate_from_image(temp_path)
            logger.info("画像生成が完了")
            
            # base64エンコード
            original_base64 = f"data:image/png;base64,{image_to_base64(input_image)}"
            generated_base64 = f"data:image/png;base64,{image_to_base64(generated_image)}"
            
            return {
                "original_image": original_base64,
                "generated_image": generated_base64
            }
        finally:
            # 一時ファイルの削除
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        error_msg = f"画像生成中にエラーが発生: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/generate/from-text")
async def generate_from_text(prompt: str = Form(...), options: DesignOptions = None):
    if options is None:
        options = DesignOptions()
    
    try:
        logger.info(f"テキスト生成リクエストを受信: {prompt}")
        
        # 一意のIDを生成
        design_id = str(uuid.uuid4())
        output_path = os.path.join(OUTPUT_DIR, f"{design_id}_output.png")
        
        # テキストプロンプトからピクセルアートを生成
        logger.info("ピクセルアート生成を開始")
        design_data = generate_pixel_art(
            input_text=prompt,
            output_path=output_path,
            size=options.size,
            palette_size=options.palette_size,
            style=options.style
        )
        logger.info("ピクセルアート生成が完了")
        
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
        logger.error(f"テキスト生成中にエラーが発生: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating design: {str(e)}")

@app.get("/designs/{design_id}")
async def get_design(design_id: str):
    logger.info(f"デザイン取得リクエスト: {design_id}")
    output_path = os.path.join(OUTPUT_DIR, f"{design_id}_output.png")
    
    if not os.path.exists(output_path):
        logger.warning(f"デザインが見つかりません: {design_id}")
        raise HTTPException(status_code=404, detail="Design not found")
    
    return FileResponse(output_path)