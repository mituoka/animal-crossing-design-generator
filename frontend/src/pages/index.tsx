import Head from "next/head";
import { useState } from "react";
import UploadForm from "../components/UploadForm";
import TextPromptForm from "../components/TextPromptForm";
import DesignDisplay from "../components/DesignDisplay";
import Tabs from "../components/Tabs";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import api from "../lib/api";

interface DesignData {
  original_image?: string;
  generated_image: string;
  size?: number;
  paletteSize?: number;
  design_id?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("text");
  const [generatedDesign, setGeneratedDesign] = useState<DesignData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDesignGenerated = (design: DesignData) => {
    setGeneratedDesign(design);
    setIsLoading(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleUploadSubmit = async (file: File, mode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("size", "32");
      formData.append("palette_size", "15");
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
    } catch (error: any) {
      console.error("Error generating design:", error);
      handleError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    }
  };

  const handleTextSubmit = async (data: {
    prompt: string;
    size: number;
    paletteSize: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("size", data.size.toString());
      formData.append("palette_size", data.paletteSize.toString());

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
    } catch (error: any) {
      console.error("Error generating design:", error);
      handleError(
        error.response?.data?.detail || "デザインの生成中にエラーが発生しました"
      );
    }
  };

  const tabs = [
    // 画像からマイデザイン作成のタブを一時的に非表示
    // { id: "upload", label: "画像からマイデザイン作成" },
    { id: "text", label: "テキストからマイデザイン作成" },
  ];

  return (
    <div>
      <Head>
        <title>Animal Crossing Design Generator</title>
        <meta name="description" content="Animal Crossing Design Generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Animal Crossing Design Generator
          </Typography>

          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {/* 画像からマイデザイン作成のフォームを一時的に非表示 */}
          {/* {activeTab === "upload" && (
            <UploadForm
              onDesignGenerated={handleDesignGenerated}
              onError={handleError}
              setIsLoading={setIsLoading}
              onSubmit={handleUploadSubmit}
            />
          )} */}

          {activeTab === "text" && (
            <TextPromptForm
              onDesignGenerated={handleDesignGenerated}
              onError={handleError}
              setIsLoading={setIsLoading}
              onSubmit={handleTextSubmit}
            />
          )}

          {generatedDesign && !isLoading && (
            <DesignDisplay design={generatedDesign} />
          )}
        </Box>
      </main>
    </div>
  );
}
