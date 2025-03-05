import Head from "next/head";
import { useState } from "react";
import UploadForm from "../components/UploadForm";
import TextPromptForm from "../components/TextPromptForm";
import DesignDisplay from "../components/DesignDisplay";
import Tabs from "../components/Tabs";

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

  const tabs = [
    { id: "upload", label: "画像からマイデザイン作成" },
    { id: "text", label: "テキストからマイデザイン作成" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>どうぶつの森マイデザインジェネレーター</title>
        <meta
          name="description"
          content="どうぶつの森のマイデザインを自動生成するツール"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-ac-green mb-8">
          どうぶつの森マイデザインジェネレーター
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="mt-6">
            {activeTab === "upload" ? (
              <UploadForm
                onDesignGenerated={handleDesignGenerated}
                onError={handleError}
                setIsLoading={setIsLoading}
              />
            ) : (
              <TextPromptForm
                onDesignGenerated={handleDesignGenerated}
                onError={handleError}
                setIsLoading={setIsLoading}
              />
            )}
          </div>

          {isLoading && (
            <div className="text-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ac-green mx-auto"></div>
              <p className="mt-4 text-gray-600">デザイン生成中...</p>
            </div>
          )}

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
              role="alert"
            >
              <strong className="font-bold">エラー: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {generatedDesign && !isLoading && !error && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                生成されたマイデザイン
              </h2>
              <DesignDisplay design={generatedDesign} />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-gray-600">
        <p>© 2025 どうぶつの森マイデザインジェネレーター</p>
      </footer>
    </div>
  );
}
