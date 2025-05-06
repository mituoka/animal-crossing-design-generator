import Head from "next/head";
import { useState } from "react";
import UploadForm from "../components/sections/UploadForm";
import TextPromptForm from "../components/sections/TextPromptForm";
import DesignDisplay from "../components/sections/DesignDisplay";
import Tabs from "../components/sections/Tabs";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import api from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDesignGenerated = (design) => {
    setGeneratedDesign(design);
    setIsLoading(false);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleUploadSubmit = async (file, mode) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("size", 32);
      formData.append("palette_size", 15);
      formData.append("style", "pixel");

      const response = await api.post("/api/generate/from-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.generated_image) {
        setGeneratedDesign({
          original_image: response.data.original_image,
          generated_image: response.data.generated_image,
          size: 32,
          paletteSize: 15,
          design_id: Date.now().toString(), // 一時的なデザインID
        });
        setIsLoading(false);
      } else {
        handleError("デザインの生成に失敗しました");
      }
    } catch (error) {
      console.error("Error generating design:", error);
      handleError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    }
  };

  const handleTextSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("size", data.size);
      formData.append("palette_size", data.paletteSize);

      const response = await api.post("/api/generate/from-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        handleDesignGenerated(response.data);
      } else {
        handleError("デザインの生成に失敗しました");
      }
    } catch (error) {
      console.error("Error generating design:", error);
      handleError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    }
  };

  const tabs = [
    { id: "upload", label: "画像からマイデザイン作成" },
    { id: "text", label: "テキストからマイデザイン作成" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Head>
        <title>マイデザインジェネレーター</title>
        <meta
          name="description"
          content="どうぶつの森のマイデザインを自動生成するツール"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box component="main" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          color="primary"
          gutterBottom
          sx={{ mb: 4 }}
        >
          マイデザインジェネレーター
        </Typography>

        <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <Box sx={{ mt: 3 }}>
            {activeTab === "upload" ? (
              <UploadForm
                onSubmit={handleUploadSubmit}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <TextPromptForm
                onSubmit={handleTextSubmit}
                isLoading={isLoading}
              />
            )}
          </Box>

          {isLoading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 4,
              }}
            >
              <CircularProgress color="primary" size={60} />
              <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                デザイン生成中...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <Typography variant="body1">
                <strong>エラー: </strong>
                {error}
              </Typography>
            </Alert>
          )}
        </Box>

        {generatedDesign && !isLoading && !error && (
          <Box sx={{ mt: 4, maxWidth: 800, mx: "auto", px: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              生成されたマイデザイン
            </Typography>
            <DesignDisplay design={generatedDesign} />
          </Box>
        )}
      </Box>

      <Box
        component="footer"
        sx={{ py: 3, textAlign: "center", color: "text.secondary" }}
      >
        <Typography variant="body2">
          © 2025 マイデザインジェネレーター
        </Typography>
      </Box>
    </Box>
  );
}
