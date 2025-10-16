
import React, { useState, useCallback, ChangeEvent } from 'react';
import { generateHuggingImage } from './services/geminiService';

const UploadIcon: React.FC = () => (
  <svg className="w-12 h-12 mx-auto text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageSelect: (base64: string) => void;
  onImageRemove: () => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageSelect, onImageRemove, id }) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <h3 className="text-xl font-semibold text-gray-300">{label}</h3>
      <div className="w-full max-w-sm h-64 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden">
        {image ? (
          <>
            <img src={image} alt={label} className="object-cover h-full w-full" />
            <button
              onClick={onImageRemove}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors"
              aria-label={`Remove ${label}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <label htmlFor={id} className="text-center cursor-pointer p-4">
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
            <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
          </label>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [childhoodImage, setChildhoodImage] = useState<string | null>(null);
  const [presentImage, setPresentImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!childhoodImage || !presentImage) {
      setError("Please upload both a childhood and a present-day photo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateHuggingImage(childhoodImage, presentImage);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [childhoodImage, presentImage]);
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'g-rabbi-studio-creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="text-center my-8">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          G.Rabbi Studio
        </h1>
        <p className="mt-4 text-lg text-gray-400">Embrace Your Inner Child</p>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center gap-10">
        <div className="w-full flex flex-col md:flex-row gap-8 md:gap-4 items-start">
          <ImageUploader
            id="childhood-upload"
            label="Childhood Photo"
            image={childhoodImage}
            onImageSelect={setChildhoodImage}
            onImageRemove={() => setChildhoodImage(null)}
          />
          <ImageUploader
            id="present-upload"
            label="Present-Day Photo"
            image={presentImage}
            onImageSelect={setPresentImage}
            onImageRemove={() => setPresentImage(null)}
          />
        </div>

        <div className="w-full max-w-md text-center">
            <button
                onClick={handleGenerateClick}
                disabled={!childhoodImage || !presentImage || isLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon />
                        Generating Your Moment...
                    </>
                ) : (
                    'Generate Image'
                )}
            </button>
        </div>

        {error && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
                <p className="font-semibold">Generation Failed</p>
                <p>{error}</p>
            </div>
        )}

        {generatedImage && (
            <section className="mt-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fade-in">
                <h2 className="text-3xl font-bold text-center">Your Generated Memory</h2>
                <div className="rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
                    <img src={generatedImage} alt="Generated nostalgic" className="w-full h-auto" />
                </div>
                 <button
                    onClick={handleDownload}
                    className="mt-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                >
                    Download Image
                </button>
            </section>
        )}
      </main>

       <footer className="text-center text-gray-600 mt-16 pb-4">
        <p>&copy; {new Date().getFullYear()} G.Rabbi Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
