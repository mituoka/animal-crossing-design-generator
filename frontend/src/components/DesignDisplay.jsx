import React, { useState } from "react";

const DesignDisplay = ({ design }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(10); // ピクセル単位でのズームレベル

  const downloadImage = () => {
    // 画像をダウンロードする処理
    const link = document.createElement("a");
    link.href = design.image;
    link.download = `animal-crossing-design-${design.design_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyDesignCode = () => {
    // 設計コードをクリップボードにコピーする処理
    // 実際のゲームでは使えないダミーコードです
    navigator.clipboard.writeText(
      `MO-${design.design_id.substring(0, 4)}-${design.design_id.substring(
        4,
        8
      )}`
    );
    alert("デザインコードをクリップボードにコピーしました");
  };

  // カラーパレットを表示
  const renderPalette = () => {
    if (!design.design_data || !design.design_data.palette) {
      return null;
    }

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">カラーパレット</h3>
        <div className="flex flex-wrap gap-2">
          {design.design_data.palette.map((color, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded border border-gray-300"
              style={{
                backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
              }}
              title={`R:${color.r} G:${color.g} B:${color.b}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // 拡大表示用のピクセルグリッド
  const renderPixelGrid = () => {
    if (
      !design.design_data ||
      !design.design_data.pixels ||
      !design.design_data.palette
    ) {
      return null;
    }

    const { width, height, pixels, palette } = design.design_data;
    const gridStyles = {
      display: "grid",
      gridTemplateColumns: `repeat(${width}, ${zoomLevel}px)`,
      gap: showGrid ? "1px" : "0",
      backgroundColor: showGrid ? "#ddd" : "transparent",
      width: "fit-content",
      margin: "0 auto",
    };

    return (
      <div className="mt-4 overflow-auto">
        <div style={gridStyles}>
          {pixels.map((pixel, index) => {
            const colorIndex = pixel.color_index;
            let backgroundColor = "transparent";

            if (colorIndex >= 0 && colorIndex < palette.length) {
              const color = palette[colorIndex];
              backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
            }

            return (
              <div
                key={index}
                style={{
                  width: `${zoomLevel}px`,
                  height: `${zoomLevel}px`,
                  backgroundColor,
                }}
                title={`X:${pixel.x}, Y:${pixel.y}`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <img
            src={design.image}
            alt="生成されたマイデザイン"
            className="max-w-full h-auto rounded border border-gray-200"
          />

          {renderPalette()}
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">拡大表示</h3>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  className="mr-2"
                />
                グリッド表示
              </label>

              <div className="flex items-center">
                <span className="mr-2">ズーム:</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="ml-2">{zoomLevel}px</span>
              </div>
            </div>

            {renderPixelGrid()}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <button
          onClick={downloadImage}
          className="bg-ac-blue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          画像をダウンロード
        </button>

        <button
          onClick={copyDesignCode}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          デザインコードをコピー
        </button>
      </div>
    </div>
  );
};

export default DesignDisplay;
