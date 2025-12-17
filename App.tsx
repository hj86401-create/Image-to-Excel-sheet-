import React, { useState, useCallback } from 'react';
import { AppState, TableData } from './types';
import { extractTableFromImage } from './services/geminiService';
import { generateExcel } from './services/excelService';
import Dropzone from './components/Dropzone';
import Button from './components/Button';
import TablePreview from './components/TablePreview';
import { 
  FileSpreadsheet, 
  ArrowRight, 
  RefreshCcw, 
  Download, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<TableData>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAppState(AppState.PREVIEW);
    setErrorMessage(null);
    setExtractedData([]);
  }, []);

  const handleConvert = async () => {
    if (!selectedFile) return;

    setAppState(AppState.PROCESSING);
    setErrorMessage(null);

    try {
      const result = await extractTableFromImage(selectedFile);
      setExtractedData(result.tableData);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong during extraction.");
      setAppState(AppState.ERROR);
    }
  };

  const handleDownload = () => {
    if (extractedData.length === 0) return;
    const filename = selectedFile?.name.split('.')[0] + '_converted.xlsx';
    generateExcel(extractedData, filename);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData([]);
    setAppState(AppState.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gemini Table Extractor</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Intro / Empty State */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto text-center animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
              Turn Images into Excel <br className="hidden sm:block" />
              <span className="text-indigo-600">in seconds.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed">
              Upload a screenshot, photo, or scan of any table. Our AI instantly extracts the data and formats it for Excel.
            </p>
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100">
              <Dropzone onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {/* Workspace (Preview + Result) */}
        {appState !== AppState.IDLE && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* Left Column: Image Preview */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center mr-2">1</span>
                  Original Image
                </h3>
                <button 
                  onClick={handleReset}
                  className="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm min-h-[400px] flex items-center justify-center overflow-hidden">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Original Upload" 
                    className="max-h-[600px] w-auto rounded-lg object-contain"
                  />
                )}
                
                {appState === AppState.PREVIEW && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button onClick={handleConvert} size="lg" className="shadow-2xl">
                       Process Image <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {appState === AppState.PREVIEW && (
                <div className="flex justify-center">
                   <Button onClick={handleConvert} className="w-full sm:w-auto px-8">
                      Convert to Excel <Sparkles className="ml-2 w-4 h-4" />
                   </Button>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="flex flex-col space-y-4">
               <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center mr-2">2</span>
                  Extracted Data
                </h3>

              {appState === AppState.PROCESSING && (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 min-h-[400px]">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
                    <div className="bg-indigo-50 p-4 rounded-full relative z-10">
                      <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="mt-6 text-lg font-medium text-slate-800">Analyzing Image...</h4>
                  <p className="text-slate-500 mt-2 text-sm max-w-xs text-center">
                    Gemini AI is identifying rows, columns, and text content.
                  </p>
                </div>
              )}

              {appState === AppState.ERROR && (
                 <div className="flex-1 flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-100 min-h-[400px] p-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                    <h4 className="text-lg font-medium text-red-800">Conversion Failed</h4>
                    <p className="text-red-600 mt-2 mb-6">{errorMessage}</p>
                    <Button variant="secondary" onClick={handleReset}>Try Another Image</Button>
                 </div>
              )}

              {appState === AppState.SUCCESS && (
                <div className="flex-1 flex flex-col animate-fadeIn">
                  <TablePreview data={extractedData} />
                  
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900">Extraction Complete</p>
                        <p className="text-sm text-green-700">Ready to export</p>
                      </div>
                    </div>
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
                      Download .XLSX <Download className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

               {appState === AppState.PREVIEW && (
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 min-h-[400px]">
                  <p className="text-slate-400">Data preview will appear here</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
