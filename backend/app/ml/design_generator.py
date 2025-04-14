import os
import numpy as np
from PIL import Image
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors

class DesignGenerator:
    def __init__(self, training_dir="data/training_images"):
        self.training_dir = training_dir
        self.pca = PCA(n_components=50)  # 特徴量の次元数
        self.nn = NearestNeighbors(n_neighbors=5)
        self.features = None
        self.images = []
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
        
        # 学習用画像の読み込み
        for filename in os.listdir(self.training_dir):
            if filename.endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(self.training_dir, filename)
                try:
                    img_array = self.load_and_preprocess_image(image_path)
                    image_data.append(img_array)
                    self.images.append(image_path)
                except Exception as e:
                    print(f"Error loading {filename}: {e}")

        if not image_data:
            raise ValueError("No valid images found in training directory")

        # 特徴量抽出
        X = np.array(image_data)
        self.features = self.pca.fit_transform(X)
        self.nn.fit(self.features)
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
        """テキストプロンプトから画像を生成（ランダムな学習画像を返す）"""
        if not self.is_trained:
            self.train()

        # ここでは簡単のためにランダムな学習画像を返す
        # 実際のテキストベースの生成はより複雑なモデルが必要
        random_index = np.random.randint(0, len(self.images))
        return Image.open(self.images[random_index]) 