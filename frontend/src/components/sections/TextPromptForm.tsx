import React, { useState } from "react";
import { Box, Typography, TextField, Slider, Paper } from "@mui/material";
import Button from "../atoms/Button";

interface TextPromptFormProps {
  onDesignGenerated: (design: any) => void;
  onError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  onSubmit: (data: {
    prompt: string;
    size: number;
    paletteSize: number;
  }) => void;
}

const TextPromptForm: React.FC<TextPromptFormProps> = ({
  onDesignGenerated,
  onError,
  setIsLoading,
  onSubmit,
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [size, setSize] = useState<number>(32);
  const [paletteSize, setPaletteSize] = useState<number>(15);
  const [style, setStyle] = useState<string>("pixel");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoadingState] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!prompt.trim()) {
      onError("デザインの説明を入力してください");
      return;
    }

    setIsSubmitting(true);
    setIsLoadingState(true);

    try {
      onSubmit({
        prompt,
        size,
        paletteSize,
      });
    } catch (error: any) {
      console.error("Error generating design:", error);
      onError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
      setIsLoadingState(false);
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
              onChange={(e, newValue) => setSize(newValue as number)}
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
              onChange={(e, newValue) => setPaletteSize(newValue as number)}
              min={2}
              max={15}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              variant="contained"
              onClick={handleSubmit}
            >
              {isSubmitting || isLoading
                ? "生成中..."
                : "マイデザインを生成する"}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default TextPromptForm;
