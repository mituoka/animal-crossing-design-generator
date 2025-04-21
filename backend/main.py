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
from app.ml.stable_diffusion_generator import StableDiffusionGenerator
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
generator = StableDiffusionGenerator()

class DesignOptions(BaseModel):
    size: int = 32  # Animal Crossingのデザインサイズ（通常は32x32）
    palette_size: int = 15  # 使用する色数（Animal Crossingは最大15色）
    style: str = "pixel"  # 変換スタイル
    prompt: Optional[str] = None  # 追加のプロンプト

@app.get("/")
def read_root():
    return {"message": "Welcome to Animal Crossing Design Generator API"}

def image_to_base64(image: Image.Image) -> str:
    """PIL Imageをbase64文字列に変換"""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@app.post("/api/generate/from-image")
async def generate_from_image(
    file: UploadFile = File(...),
    options: Optional[DesignOptions] = None
):
    """画像から類似のマイデザインを生成"""
    try:
        logger.info(f"画像生成リクエストを受信: {file.filename}")
        
        if options is None:
            options = DesignOptions()
        
        # アップロードされた画像を読み込み
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # 画像生成
        logger.info("画像生成を開始")
        generated_image = generator.generate_from_image(
            input_image,
            prompt=options.prompt,
            strength=0.75  # 元の画像の特徴をどの程度保持するか（0-1）
        )
        logger.info("画像生成が完了")
        
        # base64エンコード
        original_base64 = f"data:image/png;base64,{image_to_base64(input_image)}"
        generated_base64 = f"data:image/png;base64,{image_to_base64(generated_image)}"
        
        return {
            "original_image": original_base64,
            "generated_image": generated_base64
        }
                
    except Exception as e:
        error_msg = f"画像生成中にエラーが発生: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/generate/from-text")
async def generate_from_text(prompt: str = Form(...), options: Optional[DesignOptions] = None):
    """テキストプロンプトから画像を生成"""
    try:
        logger.info(f"テキスト生成リクエストを受信: {prompt}")
        
        if options is None:
            options = DesignOptions()
        
        # 画像生成
        logger.info("画像生成を開始")
        generated_image = generator.generate_from_text(
            prompt=prompt,
            negative_prompt="low quality, bad quality, blurry"
        )
        logger.info("画像生成が完了")
        
        # base64エンコード
        generated_base64 = f"data:image/png;base64,{image_to_base64(generated_image)}"
        
        return {
            "success": True,
            "generated_image": generated_base64
        }
    
    except Exception as e:
        error_msg = f"画像生成中にエラーが発生: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/designs/{design_id}")
async def get_design(design_id: str):
    logger.info(f"デザイン取得リクエスト: {design_id}")
    output_path = os.path.join(OUTPUT_DIR, f"{design_id}_output.png")
    
    if not os.path.exists(output_path):
        logger.warning(f"デザインが見つかりません: {design_id}")
        raise HTTPException(status_code=404, detail="Design not found")
    
    return FileResponse(output_path)