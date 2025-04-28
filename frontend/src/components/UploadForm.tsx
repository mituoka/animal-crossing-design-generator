import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

interface UploadFormProps {
  onDesignGenerated: (design: any) => void;
  onError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  onSubmit: (file: File, mode: string) => void;
}

const Input = styled("input")({
  display: "none",
});

const UploadForm: React.FC<UploadFormProps> = ({
  onDesignGenerated,
  onError,
  setIsLoading,
  onSubmit,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      onError("画像を選択してください");
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      await onSubmit(selectedFile, "similar");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      onError(
        error.response?.data?.detail ||
          "ファイルのアップロード中にエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography variant="h6" gutterBottom>
            画像をアップロード
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <label htmlFor="contained-button-file">
              <Input
                accept="image/*"
                id="contained-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <Button variant="contained" component="span">
                画像を選択
              </Button>
            </label>
          </Box>

          {selectedFile && (
            <Typography variant="body2" align="center">
              選択されたファイル: {selectedFile.name}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!selectedFile || isSubmitting}
            >
              {isSubmitting ? "生成中..." : "マイデザインを生成する"}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default UploadForm;
