import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Upload, Wand2, Loader2, Download, Sparkles } from "lucide-react";

export default function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 part
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage(base64String);
        setEditedImage(null); // Reset edited image when new one is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;
    
    setIsEditing(true);
    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: mimeType,
          prompt: prompt
        }),
      });

      if (!response.ok) throw new Error("Failed to edit image");

      const data = await response.json();
      setEditedImage(data.imageUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-display">
          Cinematic <span className="text-gradient">Memories</span>
        </h1>
        <p className="text-zinc-400 text-lg">Enhance your travel photos instantly using advanced AI.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[var(--color-teal)]" /> Upload Photo
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--color-teal)] hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {selectedImage ? (
                  <div className="absolute inset-0">
                    <img 
                      src={`data:${mimeType};base64,${selectedImage}`} 
                      alt="Original" 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2 bg-[var(--color-navy)]/80 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <Upload className="w-4 h-4" /> Change Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <ImagePlus className="w-10 h-10 mx-auto mb-4 text-zinc-500 group-hover:text-[var(--color-teal)] transition-colors" />
                    <p className="text-sm text-zinc-400 group-hover:text-zinc-300">Click or drag image to upload</p>
                    <p className="text-xs text-zinc-500 mt-2">JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-teal)]" /> AI Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make the sky more dramatic, add a hot air balloon, enhance colors..."
                className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={handleEdit}
              disabled={!selectedImage || !prompt || isEditing}
              className="glow-button w-full bg-[var(--color-ocean)] text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--color-teal)]/30"
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Applying Magic...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Edit
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Preview Section */}
        <div className="lg:col-span-8">
          <div className="glass-card p-8 rounded-3xl h-full min-h-[600px] flex flex-col">
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between font-display">
              <span className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-[var(--color-teal)]" /> AI Result
              </span>
              {editedImage && (
                <a
                  href={editedImage}
                  download="edited-travel-photo.png"
                  className="text-sm flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-[var(--color-teal)] text-white transition-colors border border-white/10"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
            </h3>
            
            <div className="flex-1 bg-[var(--color-navy)]/50 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center relative">
              {isEditing ? (
                <div className="text-center text-[var(--color-teal)]">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-[var(--color-teal)]/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[var(--color-teal)] rounded-full border-t-transparent animate-spin" />
                    <Wand2 className="absolute inset-0 m-auto w-10 h-10 animate-pulse text-[var(--color-cyan-glow)]" />
                  </div>
                  <p className="text-lg font-medium animate-pulse text-white font-display">Processing image...</p>
                </div>
              ) : editedImage ? (
                <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-zinc-500">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-ocean)] border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                    <Wand2 className="w-8 h-8 text-[var(--color-teal)] opacity-50" />
                  </div>
                  <p className="text-lg font-light">Your edited photo will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
