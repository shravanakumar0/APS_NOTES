import { jsPDF } from 'jspdf';
import { SubjectNote, LabProgram, QuestionPaper } from '../data/apsData';

// Generates an authentic, multi-page vector PDF for a VTU Subject Note
export function generateNotePDF(note: SubjectNote): { doc: jsPDF | null; filename: string; blobUrl: string } {
  if (note.pdfDataUrl) {
    const filename = note.pdfFileName || `${note.code}_Original_VTU_Document.pdf`;
    return { doc: null, filename, blobUrl: note.pdfDataUrl };
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const addHeader = (pageNum: number) => {
    // Top border line
    doc.setDrawColor(13, 148, 136); // Teal
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);

    // University Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI', pageWidth / 2, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('APS Notes - Verified Academic Material - Karnataka Engineering Curriculum', pageWidth / 2, 18, { align: 'center' });

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, 20, pageWidth - margin, 20);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`APS Notes Portal (apsnotes.com) | ${note.code} - ${note.scheme} Scheme`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  let pageNumber = 1;
  addHeader(pageNumber);
  currentY = 26;

  // Title Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'D');

  // Course Code & Scheme
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136); // Teal
  doc.text(`COURSE CODE: ${note.code}  |  ${note.scheme} SCHEME  |  SEM ${note.semester}`, margin + 4, currentY + 6);

  // Subject Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(note.title.toUpperCase(), margin + 4, currentY + 13);

  // Author & Branch
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Branch: ${note.branch}       Author / Contributor: ${note.author}       Date: ${note.updatedDate}`, margin + 4, currentY + 19);

  currentY += 30;

  // Overview / Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. COURSE OVERVIEW & SYLLABUS BLUEPRINT', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(note.description, contentWidth);
  doc.text(descLines, margin, currentY);
  currentY += descLines.length * 4.2 + 6;

  // Modules Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. MODULE-WISE DETAILED NOTES & EXAM CONCEPTS', margin, currentY);
  currentY += 6;

  note.modules.forEach((mod) => {
    // Check if new page is needed
    if (currentY > pageHeight - 50) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
    }

    // Module Header Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(1);
    doc.line(margin, currentY, margin, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`MODULE ${mod.moduleNumber}: ${mod.title}`, margin + 3, currentY + 4.8);
    currentY += 10;

    // Topics list
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Prescribed Syllabus Topics:', margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    mod.topics.forEach((topic) => {
      const topicLines = doc.splitTextToSize(`- ${topic}`, contentWidth - 4);
      if (currentY > pageHeight - 20) {
        doc.addPage();
        pageNumber++;
        addHeader(pageNumber);
        currentY = 26;
      }
      doc.text(topicLines, margin + 2, currentY);
      currentY += topicLines.length * 3.8;
    });
    currentY += 2;

    // Summary & Key Formulations Box
    if (currentY > pageHeight - 35) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
    }

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    const summaryLines = doc.splitTextToSize(mod.summary, contentWidth - 8);
    const boxHeight = summaryLines.length * 3.8 + 8;
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(13, 148, 136);
    doc.text('Key Conceptual Summary & University Exam Highlights:', margin + 3, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(summaryLines, margin + 3, currentY + 8.5);

    currentY += boxHeight + 6;
  });

  // Verification & Endorsement Box
  if (currentY > pageHeight - 40) {
    doc.addPage();
    pageNumber++;
    addHeader(pageNumber);
    currentY = 26;
  }

  doc.setFillColor(240, 253, 250); // Mint/teal light
  doc.setDrawColor(94, 234, 212);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('ACADEMIC VERIFICATION & COPYRIGHT NOTICE', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(19, 78, 74);
  const notice = `This study material for ${note.title} (${note.code}) has been published on APS Notes for educational guidance under VTU ${note.scheme} regulations. All rights reserved by APS Notes Community. Free for all engineering students.`;
  const noticeLines = doc.splitTextToSize(notice, contentWidth - 8);
  doc.text(noticeLines, margin + 4, currentY + 11);

  const cleanTitle = note.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${note.code}_${cleanTitle}_VTU_Notes.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return { doc, filename, blobUrl };
}

// Download action for Notes (Supports both original uploaded PDFs and generated vector PDFs)
export function downloadNotePDF(note: SubjectNote) {
  if (note.pdfDataUrl) {
    const filename = note.pdfFileName || `${note.code}_Original_VTU_Document.pdf`;
    const link = document.createElement('a');
    link.href = note.pdfDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
    return;
  }

  const { doc, filename } = generateNotePDF(note);
  if (!doc) return;
  try {
    doc.save(filename);
  } catch {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

// Generates an authentic PDF for Laboratory Manuals
export function generateLabPDF(lab: LabProgram): { doc: jsPDF; filename: string; blobUrl: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;
  let pageNumber = 1;

  const addHeader = (pageNum: number) => {
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI', pageWidth / 2, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APS Notes - Official Laboratory Manual & Source Code', pageWidth / 2, 18, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 20, pageWidth - margin, 20);

    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`APS Notes (apsnotes.com) | Lab: ${lab.code} (${lab.language})`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  addHeader(pageNumber);
  currentY = 26;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text(`LAB CODE: ${lab.code}  |  ${lab.scheme} SCHEME  |  LANGUAGE: ${lab.language.toUpperCase()}`, margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(lab.title, margin + 4, currentY + 13);

  currentY += 28;

  // Aim
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AIM & PROBLEM STATEMENT:', margin, currentY);
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const aimLines = doc.splitTextToSize(lab.aim, contentWidth);
  doc.text(aimLines, margin, currentY);
  currentY += aimLines.length * 3.8 + 5;

  // Algorithm
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ALGORITHM / EXECUTION PROCEDURE:', margin, currentY);
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  lab.algorithm.forEach((step) => {
    const sLines = doc.splitTextToSize(step, contentWidth - 4);
    if (currentY > pageHeight - 20) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
    }
    doc.text(sLines, margin + 2, currentY);
    currentY += sLines.length * 3.8;
  });

  currentY += 5;

  // Source Code
  if (currentY > pageHeight - 60) {
    doc.addPage();
    pageNumber++;
    addHeader(pageNumber);
    currentY = 26;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`VERIFIED SOURCE CODE (${lab.language}):`, margin, currentY);
  currentY += 5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  const codeLines = lab.sourceCode.split('\n');
  codeLines.forEach((line) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
    }
    doc.text(line.replace(/\t/g, '    '), margin + 2, currentY);
    currentY += 3.2;
  });

  currentY += 6;

  // Sample Output
  if (currentY > pageHeight - 40) {
    doc.addPage();
    pageNumber++;
    addHeader(pageNumber);
    currentY = 26;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMINAL EXECUTION & SAMPLE OUTPUT:', margin, currentY);
  currentY += 4.5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 118, 110);
  const outLines = lab.sampleOutput.split('\n');
  outLines.forEach((oLine) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
    }
    doc.text(oLine, margin + 2, currentY);
    currentY += 3.2;
  });

  const cleanTitle = lab.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${lab.code}_${cleanTitle}_Lab_Manual.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return { doc, filename, blobUrl };
}

export function downloadLabPDF(lab: LabProgram) {
  if (lab.pdfDataUrl) {
    const filename = lab.pdfFileName || `${lab.code}_Original_Lab_Manual.pdf`;
    const link = document.createElement('a');
    link.href = lab.pdfDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
    return;
  }

  const { doc, filename } = generateLabPDF(lab);
  try {
    doc.save(filename);
  } catch {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

// Generates an authentic PDF for Question Papers
export function generateQuestionPaperPDF(qp: QuestionPaper): { doc: jsPDF; filename: string; blobUrl: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;
  let pageNumber = 1;

  const addHeader = (pageNum: number) => {
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI', pageWidth / 2, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Semester End Examination / Model Question Paper - ${qp.scheme} Scheme`, pageWidth / 2, 18, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 20, pageWidth - margin, 20);

    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`APS Notes Question Paper Vault | ${qp.subjectCode}`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  addHeader(pageNumber);
  currentY = 26;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text(`COURSE CODE: ${qp.subjectCode}  |  TIME: ${qp.duration}  |  MAX MARKS: ${qp.totalMarks}`, margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(qp.subjectName.toUpperCase(), margin + 4, currentY + 13);

  currentY += 28;

  // Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Note: Answer any FIVE full questions, choosing ONE full question from each module.', margin, currentY);
  currentY += 6;

  qp.modules.forEach((mod) => {
    if (currentY > pageHeight - 45) {
      doc.addPage();
      pageNumber++;
      addHeader(pageNumber);
      currentY = 26;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`MODULE ${mod.moduleNumber}`, margin + 3, currentY + 4.2);
    currentY += 8;

    mod.questions.forEach((q) => {
      const qText = `${q.qNum}: ${q.text}`;
      const qLines = doc.splitTextToSize(qText, contentWidth - 20);
      if (currentY > pageHeight - 20) {
        doc.addPage();
        pageNumber++;
        addHeader(pageNumber);
        currentY = 26;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(qLines, margin + 2, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136);
      doc.text(`[${q.marks}M]`, pageWidth - margin - 12, currentY);
      currentY += qLines.length * 3.8 + 2;
    });
    currentY += 3;
  });

  const cleanTitle = qp.subjectName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${qp.subjectCode}_${cleanTitle}_VTU_Paper.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return { doc, filename, blobUrl };
}

export function downloadQuestionPaperPDF(qp: QuestionPaper) {
  if (qp.pdfDataUrl) {
    const filename = qp.pdfFileName || `${qp.subjectCode}_Original_Question_Paper.pdf`;
    const link = document.createElement('a');
    link.href = qp.pdfDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
    return;
  }

  const { doc, filename } = generateQuestionPaperPDF(qp);
  try {
    doc.save(filename);
  } catch {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
