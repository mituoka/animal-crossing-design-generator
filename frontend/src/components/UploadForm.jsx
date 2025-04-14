import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Button from "./Button";

const UploadForm = ({ onSubmit, isLoading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("direct");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onSubmit(file, mode);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            画像をアップロード
          </Typography>

          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              height: 200,
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "action.hover",
              },
            }}
            component="label"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {preview ? (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 150,
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  クリックしてファイルを選択
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  またはドラッグ＆ドロップ
                </Typography>
              </>
            )}
          </Box>

          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="生成モード"
            >
              <ToggleButton value="direct" aria-label="直接変換">
                直接変換
              </ToggleButton>
              <ToggleButton value="ai" aria-label="AI生成">
                AI生成
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Button
            type="submit"
            disabled={!file || isLoading}
            variant="contained"
            sx={{ mt: 2 }}
          >
            {isLoading ? "生成中..." : "マイデザインを生成する"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default UploadForm;
