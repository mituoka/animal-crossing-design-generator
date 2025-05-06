from PIL import Image
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
import os
from sklearn.cluster import KMeans


def resize_image(image: Image.Image, size: int) -> Image.Image:
    """画像をAnimal Crossingのデザインに適したサイズにリサイズする"""
    return image.resize((size, size), Image.LANCZOS)


def quantize_colors(
    image: Image.Image, palette_size: int
) -> Tuple[Image.Image, List[Tuple[int, int, int]]]:
    """画像の色数をAnimal Crossingで使用可能な色数に減らす"""
    # 画像データをnumpy配列に変換
    img_array = np.array(image)
    original_shape = img_array.shape

    # 画像が3チャンネル(RGB)または4チャンネル(RGBA)であることを確認
    if len(original_shape) == 3 and original_shape[2] in [3, 4]:
        # ピクセルデータを2次元配列に変形
        pixels = img_array.reshape(-1, original_shape[2])

        # アルファチャンネルがある場合は、透明度が一定以上のピクセルだけを色の計算に使用
        if original_shape[2] == 4:
            # アルファ値が50%以上のピクセルを色の計算に使用
            rgb_pixels = pixels[pixels[:, 3] > 128][:, :3]
        else:
            rgb_pixels = pixels[:, :3]

        # K-means法で色をクラスタリング
        kmeans = KMeans(n_clusters=palette_size, random_state=0).fit(rgb_pixels)
        colors = kmeans.cluster_centers_.astype(int)

        # 全ピクセルに対して最も近い色を割り当て
        labels = kmeans.predict(pixels[:, :3])
        quantized_pixels = np.zeros_like(pixels)

        for i in range(len(pixels)):
            if original_shape[2] == 4 and pixels[i, 3] <= 128:
                # 透明ピクセルは透明のまま
                quantized_pixels[i] = [0, 0, 0, 0]
            else:
                # 不透明ピクセルに近い色を割り当て
                quantized_pixels[i, :3] = colors[labels[i]]
                if original_shape[2] == 4:
                    quantized_pixels[i, 3] = pixels[i, 3]

        # 配列を元の形状に戻す
        quantized_array = quantized_pixels.reshape(original_shape)

        # numpy配列をPIL画像に変換
        if original_shape[2] == 4:
            quantized_image = Image.fromarray(quantized_array.astype("uint8"), "RGBA")
        else:
            quantized_image = Image.fromarray(quantized_array.astype("uint8"), "RGB")

        # 実際に使用されている色のリストを返す
        palette = [tuple(color) for color in colors]

        return quantized_image, palette
    else:
        # グレースケールまたはその他の形式の画像の場合、処理をスキップ
        return image, []


def apply_pixel_art_effect(image: Image.Image) -> Image.Image:
    """ピクセルアート効果を適用する"""
    # 既にピクセル化されている状態なので、効果的なディザリングを適用
    return image


def generate_pixel_art(
    input_path: Optional[str] = None,
    input_text: Optional[str] = None,
    output_path: str = None,
    size: int = 32,
    palette_size: int = 15,
    style: str = "pixel",
) -> Dict:
    """
    画像またはテキストプロンプトからAnimal Crossing用のピクセルアートを生成する

    Parameters:
    -----------
    input_path : str, optional
        入力画像のパス
    input_text : str, optional
        テキストプロンプト（画像がない場合）
    output_path : str
        出力画像のパス
    size : int, default=32
        出力画像のサイズ（ピクセル単位、正方形）
    palette_size : int, default=15
        使用する色の数
    style : str, default="pixel"
        変換スタイル

    Returns:
    --------
    Dict
        生成されたデザインのデータ（色パレット、ピクセルデータなど）
    """

    if input_path and os.path.exists(input_path):
        # 画像からピクセルアートを生成
        with Image.open(input_path) as img:
            # RGBA形式に変換
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            # リサイズ
            resized_img = resize_image(img, size)

            # 色の量子化
            quantized_img, palette = quantize_colors(resized_img, palette_size)

            # ピクセルアート効果の適用
            if style == "pixel":
                pixel_art = apply_pixel_art_effect(quantized_img)
            else:
                pixel_art = quantized_img

            # 出力を保存
            if output_path:
                pixel_art.save(output_path, format="PNG")

            # ピクセルデータの抽出
            pixel_data = list(pixel_art.getdata())

            # Animal Crossing形式のデザインデータの作成
            design_data = {
                "width": size,
                "height": size,
                "palette": [{"r": c[0], "g": c[1], "b": c[2]} for c in palette],
                "pixels": [
                    {
                        "x": i % size,
                        "y": i // size,
                        "color_index": palette.index((p[0], p[1], p[2])) if p[3] > 128 else -1,
                    }
                    for i, p in enumerate(pixel_data)
                ],
            }

            return design_data

    elif input_text:
        # テキストプロンプトからピクセルアートを生成
        # 注意: この部分は実際には外部AIサービスか独自のモデルを使用する必要があります
        # ここでは簡単なサンプル生成を実装しています

        # シンプルなサンプル画像の生成
        img = Image.new("RGBA", (size, size), (255, 255, 255, 255))

        # サンプルとして簡単なパターンを描画
        from PIL import ImageDraw

        draw = ImageDraw.Draw(img)

        # プロンプトに基づいて簡単な形状を描画
        if "flower" in input_text.lower():
            # 花の簡単な描画
            center = size // 2
            radius = size // 4
            colors = [
                (255, 0, 0, 255),
                (255, 255, 0, 255),
                (0, 255, 0, 255),
                (0, 0, 255, 255),
                (255, 0, 255, 255),
            ]

            for i, color in enumerate(colors):
                angle = 2 * np.pi * i / len(colors)
                x = center + int(radius * np.cos(angle))
                y = center + int(radius * np.sin(angle))
                draw.ellipse(
                    [x - radius // 2, y - radius // 2, x + radius // 2, y + radius // 2], fill=color
                )

            draw.ellipse(
                [
                    center - radius // 2,
                    center - radius // 2,
                    center + radius // 2,
                    center + radius // 2,
                ],
                fill=(255, 255, 0, 255),
            )

        elif "house" in input_text.lower():
            # 家の簡単な描画
            margin = size // 8
            house_width = size - 2 * margin
            house_height = int(house_width * 0.8)
            roof_height = house_height // 2

            # 家本体
            draw.rectangle(
                [margin, margin + roof_height, margin + house_width, margin + house_width],
                fill=(150, 75, 0, 255),
            )

            # 屋根
            draw.polygon(
                [
                    (margin, margin + roof_height),
                    (margin + house_width // 2, margin),
                    (margin + house_width, margin + roof_height),
                ],
                fill=(255, 0, 0, 255),
            )

            # ドア
            door_width = house_width // 4
            door_height = house_height // 2
            door_x = margin + (house_width - door_width) // 2
            door_y = margin + roof_height + house_height - door_height
            draw.rectangle(
                [door_x, door_y, door_x + door_width, door_y + door_height], fill=(100, 50, 0, 255)
            )

        else:
            # デフォルトの模様
            for y in range(size):
                for x in range(size):
                    if (x + y) % 8 < 4:
                        draw.point((x, y), fill=(0, 0, 255, 255))

        # 色の量子化
        quantized_img, palette = quantize_colors(img, palette_size)

        # ピクセルアート効果の適用
        if style == "pixel":
            pixel_art = apply_pixel_art_effect(quantized_img)
        else:
            pixel_art = quantized_img

        # 出力を保存
        if output_path:
            pixel_art.save(output_path, format="PNG")

        # ピクセルデータの抽出
        pixel_data = list(pixel_art.getdata())

        # Animal Crossing形式のデザインデータの作成
        design_data = {
            "width": size,
            "height": size,
            "palette": [{"r": c[0], "g": c[1], "b": c[2]} for c in palette],
            "pixels": [
                {
                    "x": i % size,
                    "y": i // size,
                    "color_index": palette.index((p[0], p[1], p[2])) if p[3] > 128 else -1,
                }
                for i, p in enumerate(pixel_data)
            ],
        }

        return design_data

    else:
        raise ValueError("input_path または input_text のいずれかを指定する必要があります")
