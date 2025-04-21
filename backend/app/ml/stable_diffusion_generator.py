import torch
from diffusers import StableDiffusionImg2ImgPipeline, StableDiffusionPipeline
from PIL import Image
import numpy as np
import os

class StableDiffusionGenerator:
    def __init__(self, model_id="runwayml/stable-diffusion-v1-5"):
        """Stable Diffusionモデルの初期化"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # テキストからの画像生成用パイプライン
        self.text2img = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        ).to(self.device)
        
        # 画像からの画像生成用パイプライン
        self.img2img = StableDiffusionImg2ImgPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        ).to(self.device)

    def generate_from_text(self, prompt, negative_prompt=None, num_steps=30, guidance_scale=7.5):
        """テキストプロンプトから画像を生成"""
        try:
            # 画像生成
            image = self.text2img(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_steps,
                guidance_scale=guidance_scale,
            ).images[0]
            
            # 32x32にリサイズ（Animal Crossingのマイデザイン用）
            image = image.resize((32, 32), Image.LANCZOS)
            
            return image
            
        except Exception as e:
            print(f"Error generating image from text: {str(e)}")
            raise

    def generate_from_image(self, input_image, prompt=None, strength=0.75, num_steps=30, guidance_scale=7.5):
        """入力画像から新しい画像を生成"""
        try:
            # 入力画像の前処理
            if input_image.size != (512, 512):
                input_image = input_image.resize((512, 512), Image.LANCZOS)
            
            # プロンプトが指定されていない場合のデフォルト
            if prompt is None:
                prompt = "pixel art style, Animal Crossing design pattern"
            
            # 画像生成
            image = self.img2img(
                prompt=prompt,
                image=input_image,
                strength=strength,
                num_inference_steps=num_steps,
                guidance_scale=guidance_scale,
            ).images[0]
            
            # 32x32にリサイズ（Animal Crossingのマイデザイン用）
            image = image.resize((32, 32), Image.LANCZOS)
            
            return image
            
        except Exception as e:
            print(f"Error generating image from image: {str(e)}")
            raise

    def __call__(self, prompt=None, input_image=None, **kwargs):
        """便利な呼び出しインターフェース"""
        if input_image is not None:
            return self.generate_from_image(input_image, prompt, **kwargs)
        elif prompt is not None:
            return self.generate_from_text(prompt, **kwargs)
        else:
            raise ValueError("Either prompt or input_image must be provided") 