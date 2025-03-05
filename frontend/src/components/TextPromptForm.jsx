import React, { useState } from "react";
import axios from "axios";

const TextPromptForm = ({ onDesignGenerated, onError, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState(32);
  const [paletteSize, setPaletteSize] = useState(15);
  const [style, setStyle] = useState("pixel");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!prompt.trim()) {
      onError("デザインの説明を入力してください");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append(
      "options",
      JSON.stringify({
        size,
        palette_size: paletteSize,
        style,
      })
    );

    try {
      const response = await axios.post("/api/generate/from-text", formData);

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
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="prompt"
        >
          デザインの説明
        </label>
        <textarea
          id="prompt"
          rows="4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例: 青い空と緑の草原、花畑のある風景"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ac-green resize-none"
        />
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

export default TextPromptForm;
