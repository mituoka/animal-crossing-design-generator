import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

interface DesignData {
  original_image?: string;
  generated_image: string;
  size?: number;
  paletteSize?: number;
  design_id?: string;
}

interface DesignDisplayProps {
  design: DesignData;
}

const DesignImage = styled("img")({
  maxWidth: "100%",
  height: "auto",
  border: "1px solid #ccc",
  borderRadius: "4px",
});

const DesignDisplay: React.FC<DesignDisplayProps> = ({ design }) => {
  const handleDownload = () => {
    // 画像をダウンロードする処理
    const link = document.createElement("a");
    link.href = design.generated_image;
    link.download = `animal-crossing-design-${
      design.design_id || Date.now()
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        生成されたマイデザイン
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {design.original_image && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              元の画像
            </Typography>
            <DesignImage src={design.original_image} alt="Original" />
          </Box>
        )}

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            生成されたマイデザイン
          </Typography>
          <DesignImage src={design.generated_image} alt="Generated" />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="contained" onClick={handleDownload}>
            マイデザインをダウンロード
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DesignDisplay;
