import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeTemplateType } from '../types';
import { getResumeTemplate } from '../templates';

/**
 * Interface to represent a detected section
 */
interface SectionInfo {
  element: HTMLElement;
  top: number; // Y position in canvas (in mm)
  bottom: number; // Final Y position in canvas (in mm)
  height: number; // Section height (in mm)
}

/**
 * Calculates section positions in canvas using pre-collected data
 */
function calculateSectionPositions(
  sectionRects: Array<{
    element: HTMLElement;
    relativeTop: number;
    relativeBottom: number;
    height: number;
  }>,
  canvas: HTMLCanvasElement,
  scale: number,
  imgHeight: number
): SectionInfo[] {
  const sections: SectionInfo[] = [];

  // html2canvas captures the element with scale
  // Canvas has dimensions: canvas.width = element.scrollWidth * scale
  // Element positions in canvas are proportional to DOM positions
  // but multiplied by scale

  // Canvas height in pixels
  const canvasHeightPx = canvas.height;

  // Conversion factor: original DOM pixels to mm in PDF
  // imgHeight is the canvas height converted to mm in PDF
  // So: 1 pixel in DOM = (imgHeight / canvasHeightPx) mm in PDF
  // But canvas was scaled, so: 1 pixel in DOM = (imgHeight / (canvasHeightPx / scale)) mm
  const pixelsPerMm = (canvasHeightPx / scale) / imgHeight;

  sectionRects.forEach((sectionRect) => {
    // Convert DOM pixels to mm in PDF
    const topMm = sectionRect.relativeTop / pixelsPerMm;
    const bottomMm = sectionRect.relativeBottom / pixelsPerMm;
    const heightMm = bottomMm - topMm;

    sections.push({
      element: sectionRect.element,
      top: topMm,
      bottom: bottomMm,
      height: heightMm,
    });
  });

  // Sort by top position
  sections.sort((a, b) => a.top - b.top);

  return sections;
}

/**
 * Extracts a specific part of the canvas as a new image
 */
function extractCanvasSection(
  canvas: HTMLCanvasElement,
  startY: number,
  height: number,
  imgWidth: number,
  imgHeight: number,
  scale: number
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate positions in pixels in canvas
  // startY and height are in mm in PDF
  // We need to convert to pixels in canvas
  const canvasHeightPx = canvas.height;
  const canvasWidthPx = canvas.width;

  // Conversion factor: mm in PDF to pixels in canvas
  // imgHeight (mm) corresponds to canvasHeightPx (pixels)
  const mmPerPx = imgHeight / canvasHeightPx;
  const pixelsPerMm = canvasHeightPx / imgHeight;

  const startYPx = Math.floor(startY * pixelsPerMm);
  const heightPx = Math.ceil(height * pixelsPerMm);

  // Ensure we don't exceed canvas limits
  const actualStartYPx = Math.max(0, Math.min(startYPx, canvasHeightPx));
  const actualHeightPx = Math.min(heightPx, canvasHeightPx - actualStartYPx);

  if (actualHeightPx <= 0) {
    // If height is 0 or negative, return an empty image
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = canvasWidthPx;
    emptyCanvas.height = 1;
    return emptyCanvas.toDataURL('image/png', 1.0);
  }

  // Create a new canvas for the section
  const sectionCanvas = document.createElement('canvas');
  sectionCanvas.width = canvasWidthPx;
  sectionCanvas.height = actualHeightPx;
  const sectionCtx = sectionCanvas.getContext('2d');

  if (!sectionCtx) {
    throw new Error('Could not create section canvas context');
  }

  // Copy the part from the original canvas
  sectionCtx.drawImage(
    canvas,
    0, actualStartYPx, canvasWidthPx, actualHeightPx, // source
    0, 0, canvasWidthPx, actualHeightPx // destination
  );

  return sectionCanvas.toDataURL('image/png', 1.0);
}

/**
 * Adds pages to PDF respecting sections, avoiding breaks in the middle of them
 */
function addPagesWithSectionAwareness(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  imgWidth: number,
  imgHeight: number,
  pdfHeight: number,
  sections: SectionInfo[],
  scale: number
): void {
  let position = 0; // Current Y position in canvas (in mm)
  let pageNumber = 0;

  while (position < imgHeight) {
    const remainingHeight = imgHeight - position;
    const availablePageHeight = pdfHeight;

    // Check if there's a section that would start on this page but wouldn't fit completely
    const nextSection = sections.find(
      (section) => section.top >= position && section.top < position + availablePageHeight
    );

    let contentHeight: number;

    if (nextSection) {
      // Check if the complete section fits on the current page
      const sectionFits = nextSection.bottom <= position + availablePageHeight;

      if (!sectionFits) {
        // The section doesn't fit completely on the current page
        // Move the entire section to the next page
        if (nextSection.top > position) {
          // There's content before the section - add up to before it
          contentHeight = nextSection.top - position;

          if (contentHeight > 0) {
            const sectionImage = extractCanvasSection(
              canvas,
              position,
              contentHeight,
              imgWidth,
              imgHeight,
              scale
            );

            pdf.addImage(
              sectionImage,
              'PNG',
              0,
              0,
              imgWidth,
              contentHeight
            );

            position = nextSection.top;
          }
        }

        // Go to next page to place the entire section
        if (position < imgHeight) {
          pdf.addPage();
          pageNumber++;
        }

        // Add the complete section on the new page
        const sectionHeight = nextSection.bottom - nextSection.top;
        const sectionImage = extractCanvasSection(
          canvas,
          nextSection.top,
          sectionHeight,
          imgWidth,
          imgHeight,
          scale
        );

        pdf.addImage(
          sectionImage,
          'PNG',
          0,
          0,
          imgWidth,
          sectionHeight
        );

        position = nextSection.bottom;

        // If there's still content after the section, continue
        if (position < imgHeight) {
          pdf.addPage();
          pageNumber++;
        }
        continue;
      } else {
        // The section fits on the current page, add normally
        contentHeight = Math.min(availablePageHeight, remainingHeight);
      }
    } else {
      // No section in this part, add normally
      contentHeight = Math.min(availablePageHeight, remainingHeight);
    }

    // Extract and add the canvas part
    const sectionImage = extractCanvasSection(
      canvas,
      position,
      contentHeight,
      imgWidth,
      imgHeight,
      scale
    );

    pdf.addImage(
      sectionImage,
      'PNG',
      0,
      0,
      imgWidth,
      contentHeight
    );

    position += contentHeight;

    // If there's still content, add new page
    if (position < imgHeight) {
      pdf.addPage();
      pageNumber++;
    }
  }
}

/**
 * Options for PDF generation
 */
export interface GenerateResumePDFOptions {
  /**
   * Template type to be used to generate the PDF
   * @default ResumeTemplateType.CLASSIC
   */
  templateType?: ResumeTemplateType;

  /**
   * PDF file name (without extension)
   * If not provided, will be generated automatically
   */
  fileName?: string;

  /**
   * Delay in milliseconds before capturing the element
   * Useful to ensure images and styles are loaded
   * @default 300
   */
  captureDelay?: number;

  /**
   * Capture scale (affects quality)
   * Higher values = better quality, but larger file
   * @default 2
   */
  scale?: number;

  /**
   * PDF format
   * @default 'a4'
   */
  format?: 'a4' | 'letter';

  /**
   * PDF orientation
   * @default 'portrait'
   */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Use case: Generates and downloads the resume PDF
 * 
 * Captures the HTML element of the specified template and converts it to PDF.
 * The element is temporarily moved outside the viewport during capture
 * to avoid interfering with page viewing.
 * 
 * @param options - PDF generation options
 * @throws {Error} If the resume element is not found
 * 
 * @example
 * ```typescript
 * // Basic generation with default template
 * await generateResumePDF();
 * 
 * // Generation with specific template and options
 * await generateResumePDF({
 *   templateType: ResumeTemplateType.MODERN,
 *   fileName: 'My_Resume_2024',
 *   scale: 3,
 *   captureDelay: 500,
 * });
 * ```
 */
export async function generateResumePDF(
  options: GenerateResumePDFOptions = {}
): Promise<void> {
  const {
    templateType = ResumeTemplateType.MODERN,
    fileName,
    captureDelay = 300,
    scale = 2,
    format = 'a4',
    orientation = 'portrait',
  } = options;

  // Get the template and its element ID
  const template = getResumeTemplate(templateType);
  const resumeElementId = template.getResumeElementId(templateType);
  const resumeElement = document.getElementById(resumeElementId);

  if (!resumeElement) {
    throw new Error(
      `Resume content not found for template "${templateType}". ` +
      `Element ID: "${resumeElementId}". ` +
      `Make sure the Resume component is rendered with templateType="${templateType}"`
    );
  }

  try {
    // Save original styles of element and parent
    const parentElement = resumeElement.parentElement;
    const originalStyles = {
      parent: {
        display: parentElement?.style.display || '',
        position: parentElement?.style.position || '',
        left: parentElement?.style.left || '',
        top: parentElement?.style.top || '',
        zIndex: parentElement?.style.zIndex || '',
      },
      element: {
        display: resumeElement.style.display,
        position: resumeElement.style.position,
        left: resumeElement.style.left,
        top: resumeElement.style.top,
        zIndex: resumeElement.style.zIndex,
        opacity: resumeElement.style.opacity,
        visibility: resumeElement.style.visibility,
        transform: resumeElement.style.transform,
      },
    };

    // Show element temporarily outside viewport
    if (parentElement) {
      parentElement.style.display = 'block';
      parentElement.style.position = 'absolute';
      parentElement.style.left = '-9999px';
      parentElement.style.top = '0';
      parentElement.style.zIndex = '-1';
    }

    resumeElement.style.display = 'block';
    resumeElement.style.position = 'relative';
    resumeElement.style.left = '0';
    resumeElement.style.top = '0';
    resumeElement.style.zIndex = '-1';
    resumeElement.style.opacity = '1';
    resumeElement.style.visibility = 'visible';
    resumeElement.style.transform = 'none';

    // Wait a moment to ensure the element is rendered
    // This is important for images and fonts to load
    await new Promise(resolve => setTimeout(resolve, captureDelay));

    // Detect sections BEFORE capturing the canvas
    // This is necessary because getBoundingClientRect needs the visible element
    const sectionElements = Array.from(resumeElement.querySelectorAll('section'));
    const sectionRects = sectionElements.map((section) => {
      const rect = section.getBoundingClientRect();
      const resumeRect = resumeElement.getBoundingClientRect();
      return {
        element: section as HTMLElement,
        relativeTop: rect.top - resumeRect.top,
        relativeBottom: rect.bottom - resumeRect.top,
        height: rect.height,
      };
    });

    // Criar canvas HTML com alta qualidade
    const canvas = await html2canvas(resumeElement, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight,
      windowWidth: resumeElement.scrollWidth,
      windowHeight: resumeElement.scrollHeight,
      allowTaint: false,
      removeContainer: false,
    });

    // Restaurar estilos originais
    if (parentElement) {
      parentElement.style.display = originalStyles.parent.display;
      parentElement.style.position = originalStyles.parent.position;
      parentElement.style.left = originalStyles.parent.left;
      parentElement.style.top = originalStyles.parent.top;
      parentElement.style.zIndex = originalStyles.parent.zIndex;
    }

    resumeElement.style.display = originalStyles.element.display;
    resumeElement.style.position = originalStyles.element.position;
    resumeElement.style.left = originalStyles.element.left;
    resumeElement.style.top = originalStyles.element.top;
    resumeElement.style.zIndex = originalStyles.element.zIndex;
    resumeElement.style.opacity = originalStyles.element.opacity;
    resumeElement.style.visibility = originalStyles.element.visibility;
    resumeElement.style.transform = originalStyles.element.transform;

    // Calcular dimensões do PDF
    const pdfDimensions = {
      a4: { width: 210, height: 297 }, // mm
      letter: { width: 216, height: 279 }, // mm
    };

    const { width: pdfWidth, height: pdfHeight } = pdfDimensions[format];
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Calcular posições das seções no canvas usando os dados coletados antes
    const sections = calculateSectionPositions(sectionRects, canvas, scale, imgHeight);

    // Criar PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Dividir em páginas respeitando as seções
    addPagesWithSectionAwareness(
      pdf,
      canvas,
      imgWidth,
      imgHeight,
      pdfHeight,
      sections,
      scale
    );

    // Generate file name if not provided
    const finalFileName = fileName ||
      `Resume_${templateType}_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;

    // Fazer download do PDF
    pdf.save(finalFileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

