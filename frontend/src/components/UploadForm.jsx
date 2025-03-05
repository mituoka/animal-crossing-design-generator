import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const UploadForm = ({ onDesignGenerated, onError, setIsLoading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [size, setSize] = useState(32);
  const [paletteSize, setPaletteSize] = useState(15);
  const [style, setStyle] = useState("pixel");

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      // プレビュー用にURLを生成
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      // コンポーネントがアンマウントされたときにURLを解放
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      onError("画像ファイルをアップロードしてください");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", size);
    formData.append("palette_size", paletteSize);
    formData.append("style", style);

    try {
      const response = await axios.post("/api/generate/from-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        onDesignGenerated(response.data);
      } else {
        onError("デザインの生成に失敗しました");
      }
    } catch (error) {
      console.error("Error generating design:", error);
      onError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-ac-green bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />

          {preview ? (
            <div className="flex flex-col items-center">
              <img
                src={preview}
                alt="アップロード画像プレビュー"
                className="max-h-64 max-w-full mb-4"
              />
              <p className="text-sm text-gray-500">
                クリックまたはドラッグ＆ドロップで画像を変更
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              <p className="text-gray-600 mb-2">
                クリックまたはドラッグ＆ドロップで画像をアップロード
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF (最大10MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="size"
          >
            サイズ ({size}x{size}px)
          </label>
          <input
            id="size"
            type="range"
            min="16"
            max="64"
            step="8"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paletteSize"
          >
            色数 ({paletteSize}色)
          </label>
          <input
            id="paletteSize"
            type="range"
            min="2"
            max="15"
            value={paletteSize}
            onChange={(e) => setPaletteSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="style"
          >
            スタイル
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ac-green"
          >
            <option value="pixel">ピクセルアート</option>
            <option value="simple">シンプル</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-ac-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ac-green"
        >
          マイデザインを生成する
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
