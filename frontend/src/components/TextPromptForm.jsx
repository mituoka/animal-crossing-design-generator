import React, { useState } from "react";
import { Box, Typography, TextField, Slider, Paper } from "@mui/material";
import Button from "./Button";

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
    <Paper elevation={3} sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <TextField
            label="デザインの説明"
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例：青い空と白い雲、緑の草原に黄色い花が咲いている"
            fullWidth
          />

          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              サイズ ({size}x{size}px)
            </Typography>
            <Slider
              value={size}
              onChange={(e, newValue) => setSize(newValue)}
              min={16}
              max={64}
              step={8}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>色数 ({paletteSize}色)</Typography>
            <Slider
              value={paletteSize}
              onChange={(e, newValue) => setPaletteSize(newValue)}
              min={2}
              max={15}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              disabled={!prompt.trim() || setIsLoading}
              variant="contained"
            >
              {setIsLoading ? "生成中..." : "マイデザインを生成する"}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default TextPromptForm;
