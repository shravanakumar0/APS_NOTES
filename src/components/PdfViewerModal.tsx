import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SubjectNote, LabProgram, QuestionPaper } from '../data/apsData';
import { downloadNotePDF, downloadLabPDF, downloadQuestionPaperPDF } from '../utils/pdfExport';
import {
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type DocumentType =
  | { type: 'note'; data: SubjectNote }
  | { type: 'lab'; data: LabProgram }
  | { type: 'paper'; data: QuestionPaper };

interface Props {
  document: DocumentType | null;
  isOpen: boolean;
  onClose: () => void;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const PdfViewerModal: React.FC<Props> = ({ document: docItem, isOpen, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputVal, setPageInputVal] = useState<string>('1');

  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load PDF document from uploaded base64 dataUrl or fallback
  useEffect(() => {
    if (!isOpen || !docItem) {
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setScale(1.0);
      setRotation(0);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    const loadPdf = async () => {
      try {
        const rawDataUrl = docItem.data.pdfDataUrl;
        if (!rawDataUrl) {
          throw new Error('No uploaded PDF data attached to this document.');
        }

        const uint8Data = dataUrlToUint8Array(rawDataUrl);
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Data,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setPageInputVal('1');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load PDF with PDF.js:', err);
        if (!isCancelled) {
          setErrorMessage(err.message || 'Failed to render PDF document.');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [docItem, isOpen]);

  // Render the current page onto HTML5 Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !mainCanvasRef.current) return;

      try {
        // Cancel ongoing render if any
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Task might have already completed
          }
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        const canvas = mainCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Device pixel ratio for retina / high-DPI crisp text rendering
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale, rotation: rotation });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // Reset transform and scale for DPR
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    },
    [pdfDoc, scale, rotation]
  );

  useEffect(() => {
    if (pdfDoc && numPages > 0) {
      renderPage(currentPage);
      setPageInputVal(currentPage.toString());
    }
  }, [pdfDoc, currentPage, scale, rotation, renderPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((p) => Math.min(numPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, numPages, onClose]);

  if (!isOpen || !docItem) return null;

  const pdfFileName =
    docItem.data.pdfFileName ||
    `${docItem.type === 'note' ? docItem.data.code : 'document'}.pdf`;

  const handleDownload = () => {
    if (docItem.type === 'note') {
      downloadNotePDF(docItem.data);
    } else if (docItem.type === 'lab') {
      downloadLabPDF(docItem.data);
    } else if (docItem.type === 'paper') {
      downloadQuestionPaperPDF(docItem.data);
    }
  };

  const handlePrint = () => {
    const rawDataUrl = docItem.data.pdfDataUrl;
    if (!rawDataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(
      `<html><head><title>${pdfFileName}</title></head><body style="margin:0;"><embed width="100%" height="100%" name="plugin" src="${rawDataUrl}" type="application/pdf"></body></html>`
    );
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const handleZoomIn = () => setScale((s) => Math.min(3.0, Number((s + 0.15).toFixed(2))));
  const handleZoomOut = () => setScale((s) => Math.max(0.4, Number((s - 0.15).toFixed(2))));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputVal(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInputVal, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInputVal(currentPage.toString());
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs select-none ${
        isFullscreen ? 'p-0' : 'p-0 sm:p-3'
      }`}
    >
      <div
        className={`relative w-full bg-[#18181b] border border-zinc-800 flex flex-col overflow-hidden text-zinc-200 shadow-2xl transition-all ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-7xl h-[96vh] rounded-2xl'
        }`}
      >
        {/* TOP TOOLBAR - Matches Image 2 authentic Chrome / PDF.js header */}
        <div className="bg-[#27272a] px-3 sm:px-4 py-2 border-b border-zinc-700/80 flex items-center justify-between gap-2 text-xs shrink-0 select-none">
          {/* Left section: Sidebar Toggle & File Name */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <button
              onClick={() => setShowSidebar((s) => !s)}
              className={`p-1.5 rounded-md hover:bg-zinc-700 transition-colors cursor-pointer text-zinc-300 ${
                showSidebar ? 'bg-zinc-700 text-white' : ''
              }`}
              title="Toggle Thumbnails Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              <FileText className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-semibold text-zinc-100 truncate text-[13px]">
                {pdfFileName}
              </span>
            </div>
          </div>

          {/* Center section: Pagination & Zoom Controls (Exactly like Image 2: "1 / 27  - 80% + rotate") */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-zinc-800/90 px-2 py-1 rounded-md border border-zinc-700">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <form onSubmit={handlePageInputSubmit} className="flex items-center">
                <input
                  type="text"
                  value={pageInputVal}
                  onChange={handlePageInputChange}
                  onBlur={() => setPageInputVal(currentPage.toString())}
                  className="w-8 text-center bg-zinc-900 text-white border border-zinc-700 rounded text-xs py-0.5 font-mono focus:outline-hidden focus:border-teal-500"
                />
              </form>
              <span className="text-zinc-400 font-mono text-xs">/ {numPages || 1}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-700 hidden sm:block" />

            {/* Zoom Controls: - 80% + */}
            <div className="flex items-center gap-1 bg-zinc-800/90 px-2 py-1 rounded-md border border-zinc-700">
              <button
                onClick={handleZoomOut}
                className="p-0.5 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs w-11 text-center font-bold text-zinc-200">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-0.5 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Rotate Clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Right section: Download, Print, Fullscreen, Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              title="Download PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: Split into Left Thumbnail Sidebar + Center High-Res Canvas */}
        <div className="flex-1 flex overflow-hidden bg-[#333333] relative">
          {/* THUMBNAIL SIDEBAR (Exactly like Image 2 left panel) */}
          {showSidebar && numPages > 0 && (
            <div className="w-40 sm:w-48 bg-[#202022] border-r border-zinc-700/80 overflow-y-auto p-3 space-y-3 shrink-0 scrollbar-thin">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
                Pages ({numPages})
              </div>
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <ThumbnailItem
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNum={pageNum}
                  isSelected={currentPage === pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                />
              ))}
            </div>
          )}

          {/* MAIN PAGE CANVAS VIEWER (Exactly like Image 2 center document) */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8 bg-[#383838]"
          >
            {isLoading && (
              <div className="flex flex-col items-center justify-center my-auto space-y-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                <span className="text-sm font-semibold">Rendering PDF document...</span>
              </div>
            )}

            {errorMessage && (
              <div className="my-auto p-6 max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl text-center space-y-3 shadow-xl">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Document Display Error</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Download Original PDF Instead
                </button>
              </div>
            )}

            {/* The Document Canvas with white page background and shadow, matching Image 2 */}
            <div
              className={`transition-opacity duration-150 ${
                isLoading ? 'opacity-0 h-0' : 'opacity-100'
              }`}
            >
              <canvas
                ref={mainCanvasRef}
                className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-zinc-400/30 rounded-xs mx-auto block"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM QUICK FOOTER BAR */}
        <div className="bg-[#202022] px-4 py-1.5 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">
              Page {currentPage} of {numPages || 1}
            </span>
            <span>•</span>
            <span>Handwritten &amp; Digital VTU Manuscript Viewer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Use &larr; &rarr; arrow keys to navigate pages</span>
            <button
              onClick={() => setScale(1.0)}
              className="text-teal-400 hover:underline cursor-pointer"
            >
              Reset 100%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component to render thumbnail for each page in left panel (like in Image 2)
interface ThumbnailItemProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageNum: number;
  isSelected: boolean;
  onClick: () => void;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  pdfDoc,
  pageNum,
  isSelected,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!pdfDoc) return;
    let isCancelled = false;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 0.22 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        }).promise;
      } catch (err) {
        // Thumbnail render error can be ignored gracefully
      }
    };

    renderThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer flex flex-col items-center gap-1.5 p-1.5 rounded-lg transition-all ${
        isSelected
          ? 'bg-teal-500/20 ring-2 ring-teal-500 shadow-md'
          : 'hover:bg-zinc-800/80 opacity-75 hover:opacity-100'
      }`}
    >
      <div className="bg-white rounded-xs shadow-md overflow-hidden border border-zinc-600 flex items-center justify-center min-h-[90px] w-full">
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
      <span
        className={`text-[10px] font-mono font-bold ${
          isSelected ? 'text-teal-300 font-black' : 'text-zinc-400'
        }`}
      >
        {pageNum}
      </span>
    </div>
  );
};
