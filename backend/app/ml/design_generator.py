import os
import numpy as np
from PIL import Image
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
import re

class DesignGenerator:
    def __init__(self, training_dir="data/training_images"):
        self.training_dir = training_dir
        self.pca = PCA(n_components=50)  # 特徴量の次元数
        self.nn = NearestNeighbors(n_neighbors=5)
        self.features = None
        self.images = []
        self.image_descriptions = {}  # 画像の説明文を保持
        self.tfidf = TfidfVectorizer(max_features=1000)
        self.is_trained = False

    def load_and_preprocess_image(self, image_path):
        """画像を読み込んで前処理を行う"""
        img = Image.open(image_path)
        img = img.resize((32, 32))  # サイズを統一
        img_array = np.array(img)
        if len(img_array.shape) == 3:  # カラー画像の場合
            img_array = img_array.reshape(-1)  # 1次元に変換
        return img_array

    def train(self):
        """学習用画像から特徴量を抽出"""
        image_data = []
        descriptions = []
        
        # 学習用画像の読み込み
        for filename in os.listdir(self.training_dir):
            if filename.endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(self.training_dir, filename)
                try:
                    img_array = self.load_and_preprocess_image(image_path)
                    image_data.append(img_array)
                    self.images.append(image_path)
                    
                    # ファイル名から説明文を生成
                    description = re.sub(r'[_-]', ' ', os.path.splitext(filename)[0])
                    descriptions.append(description)
                    self.image_descriptions[image_path] = description
                except Exception as e:
                    print(f"Error loading {filename}: {e}")

        if not image_data:
            raise ValueError("No valid images found in training directory")

        # 特徴量抽出
        X = np.array(image_data)
        self.features = self.pca.fit_transform(X)
        self.nn.fit(self.features)
        
        # テキスト特徴量の学習
        self.tfidf.fit(descriptions)
        self.is_trained = True

    def generate_from_image(self, input_image_path):
        """入力画像から類似画像を生成"""
        if not self.is_trained:
            self.train()

        # 入力画像の特徴量を抽出
        input_array = self.load_and_preprocess_image(input_image_path)
        input_features = self.pca.transform(input_array.reshape(1, -1))

        # 最も近い特徴量を持つ画像を探す
        distances, indices = self.nn.kneighbors(input_features)
        
        # 最も類似度の高い画像を返す
        similar_image_path = self.images[indices[0][0]]
        return Image.open(similar_image_path)

    def generate_from_text(self, text_prompt):
        """テキストプロンプトから画像を生成"""
        if not self.is_trained:
            self.train()

        # テキストプロンプトの特徴量を抽出
        prompt_features = self.tfidf.transform([text_prompt]).toarray()
        
        # 各画像の説明文との類似度を計算
        similarities = []
        for img_path in self.images:
            desc = self.image_descriptions[img_path]
            desc_features = self.tfidf.transform([desc]).toarray()
            similarity = np.dot(prompt_features, desc_features.T)[0][0]
            similarities.append(similarity)
        
        # 最も類似度の高い3つの画像を選択
        top_indices = np.argsort(similarities)[-3:][::-1]
        
        # 選択された画像を組み合わせて新しい画像を生成
        combined_image = Image.new('RGB', (32, 32))
        for i, idx in enumerate(top_indices):
            img = Image.open(self.images[idx])
            img = img.resize((32, 32))
            # 重み付けして画像を合成
            weight = similarities[idx] / sum(similarities[j] for j in top_indices)
            img_array = np.array(img) * weight
            if i == 0:
                combined_array = img_array
            else:
                combined_array += img_array
        
        combined_array = np.clip(combined_array, 0, 255).astype(np.uint8)
        return Image.fromarray(combined_array) 