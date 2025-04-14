import React, { useState } from "react";
import Button from "./Button";
import { Box, Typography, Grid, Paper } from "@mui/material";

const DesignDisplay = ({ design, onDownload, onRegenerate }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(10); // ピクセル単位でのズームレベル

  const downloadImage = () => {
    // 画像をダウンロードする処理
    const link = document.createElement("a");
    link.href = design.generated_image;
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
    <Box>
      <Grid container spacing={3}>
        {design.original_image && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                元の画像
              </Typography>
              <Box
                component="img"
                src={design.original_image}
                alt="元の画像"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "300px",
                  margin: "0 auto",
                  display: "block",
                  borderRadius: 1,
                }}
              />
            </Paper>
          </Grid>
        )}
        {design.generated_image && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                生成された画像
              </Typography>
              <Box
                component="img"
                src={design.generated_image}
                alt="生成された画像"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "300px",
                  margin: "0 auto",
                  display: "block",
                  borderRadius: 1,
                }}
              />
            </Paper>
          </Grid>
        )}
        {design.pixel_art && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                マイデザイン
              </Typography>
              <Box
                component="img"
                src={`data:image/png;base64,${design.pixel_art}`}
                alt="マイデザイン"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 1,
                }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          デザイン情報
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              サイズ
            </Typography>
            <Typography variant="body1">
              {design.size}x{design.size}px
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              使用色数
            </Typography>
            <Typography variant="body1">{design.paletteSize}色</Typography>
          </Grid>
          {design.prompt && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                プロンプト
              </Typography>
              <Typography variant="body1">{design.prompt}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

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
    </Box>
  );
};

export default DesignDisplay;
