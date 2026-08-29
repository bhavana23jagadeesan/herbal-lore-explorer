import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type IdentifyResponse } from "@/lib/api";
import { Camera, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/identify")({
  component: IdentifyPage,
});

function IdentifyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const res = await api.identifyPlant(selectedFile);
      setResult(res);
    } catch {
      alert("Error processing plant image identification.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Computer Vision Model"
        title="Plant Species Identification"
        subtitle="Upload or snap a photo of a plant leaf/flower to classify species with MobileNetV2 deep learning architecture."
      />

      <div className="mx-auto max-w-3xl glass rounded-3xl p-6 sm:p-8 space-y-8">
        {/* Dropzone & Preview */}
        {!previewUrl ? (
          <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <div className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary mb-4">
              <Camera className="size-8" />
            </div>
            <p className="font-semibold text-lg">Click or drag plant image to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG up to 10MB</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden max-h-80 mx-auto flex justify-center bg-black/20">
              <img src={previewUrl} alt="Plant Preview" className="object-contain h-80 w-auto rounded-2xl" />
              <button
                onClick={reset}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
                title="Change Image"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>

            {!result && (
              <div className="flex justify-center">
                <button
                  onClick={handleIdentify}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-5 animate-spin" /> Classifying Species with MobileNetV2...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" /> Identify Plant Species
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clean Results Display */}
        {result && (
          <div className="glass-strong rounded-3xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-8 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-display text-2xl font-bold">{result.plant_name}</h3>
                  <p className="text-sm italic text-muted-foreground">
                    Match Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-full px-3 py-1">
                Verified Species
              </Badge>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
