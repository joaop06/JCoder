import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeTemplateType } from '../types';
import { getResumeTemplate } from '../templates';

/**
 * Interface para representar uma seção detectada
 */
interface SectionInfo {
  element: HTMLElement;
  top: number; // Posição Y no canvas (em mm)
  bottom: number; // Posição Y final no canvas (em mm)
  height: number; // Altura da seção (em mm)
}

/**
 * Calcula as posições das seções no canvas usando dados pré-coletados
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

  // O html2canvas captura o elemento com scale
  // O canvas tem dimensões: canvas.width = element.scrollWidth * scale
  // As posições dos elementos no canvas são proporcionais às posições no DOM
  // mas multiplicadas pelo scale

  // Altura do canvas em pixels
  const canvasHeightPx = canvas.height;

  // Fator de conversão: pixels do DOM original para mm no PDF
  // imgHeight é a altura do canvas convertida para mm no PDF
  // Então: 1 pixel no DOM = (imgHeight / canvasHeightPx) mm no PDF
  // Mas o canvas foi escalado, então: 1 pixel no DOM = (imgHeight / (canvasHeightPx / scale)) mm
  const pixelsPerMm = (canvasHeightPx / scale) / imgHeight;

  sectionRects.forEach((sectionRect) => {
    // Converter pixels do DOM para mm no PDF
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

  // Ordenar por posição top
  sections.sort((a, b) => a.top - b.top);

  return sections;
}

/**
 * Extrai uma parte específica do canvas como uma nova imagem
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

  // Calcular posições em pixels no canvas
  // startY e height estão em mm no PDF
  // Precisamos converter para pixels no canvas
  const canvasHeightPx = canvas.height;
  const canvasWidthPx = canvas.width;

  // Fator de conversão: mm no PDF para pixels no canvas
  // imgHeight (mm) corresponde a canvasHeightPx (pixels)
  const mmPerPx = imgHeight / canvasHeightPx;
  const pixelsPerMm = canvasHeightPx / imgHeight;

  const startYPx = Math.floor(startY * pixelsPerMm);
  const heightPx = Math.ceil(height * pixelsPerMm);

  // Garantir que não ultrapassamos os limites do canvas
  const actualStartYPx = Math.max(0, Math.min(startYPx, canvasHeightPx));
  const actualHeightPx = Math.min(heightPx, canvasHeightPx - actualStartYPx);

  if (actualHeightPx <= 0) {
    // Se a altura for 0 ou negativa, retornar uma imagem vazia
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = canvasWidthPx;
    emptyCanvas.height = 1;
    return emptyCanvas.toDataURL('image/png', 1.0);
  }

  // Criar um novo canvas para a seção
  const sectionCanvas = document.createElement('canvas');
  sectionCanvas.width = canvasWidthPx;
  sectionCanvas.height = actualHeightPx;
  const sectionCtx = sectionCanvas.getContext('2d');

  if (!sectionCtx) {
    throw new Error('Could not create section canvas context');
  }

  // Copiar a parte do canvas original
  sectionCtx.drawImage(
    canvas,
    0, actualStartYPx, canvasWidthPx, actualHeightPx, // source
    0, 0, canvasWidthPx, actualHeightPx // destination
  );

  return sectionCanvas.toDataURL('image/png', 1.0);
}

/**
 * Adiciona páginas ao PDF respeitando as seções, evitando quebras no meio delas
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
  let position = 0; // Posição Y atual no canvas (em mm)
  let pageNumber = 0;

  while (position < imgHeight) {
    const remainingHeight = imgHeight - position;
    const availablePageHeight = pdfHeight;

    // Verificar se há uma seção que começaria nesta página mas não caberia completamente
    const nextSection = sections.find(
      (section) => section.top >= position && section.top < position + availablePageHeight
    );

    let contentHeight: number;

    if (nextSection) {
      // Verificar se a seção completa cabe na página atual
      const sectionFits = nextSection.bottom <= position + availablePageHeight;

      if (!sectionFits) {
        // A seção não cabe completamente na página atual
        // Mover a seção inteira para a próxima página
        if (nextSection.top > position) {
          // Há conteúdo antes da seção - adicionar até antes dela
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

        // Ir para próxima página para colocar a seção inteira
        if (position < imgHeight) {
          pdf.addPage();
          pageNumber++;
        }

        // Adicionar a seção completa na nova página
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

        // Se ainda há conteúdo após a seção, continuar
        if (position < imgHeight) {
          pdf.addPage();
          pageNumber++;
        }
        continue;
      } else {
        // A seção cabe na página atual, adicionar normalmente
        contentHeight = Math.min(availablePageHeight, remainingHeight);
      }
    } else {
      // Não há seção nesta parte, adicionar normalmente
      contentHeight = Math.min(availablePageHeight, remainingHeight);
    }

    // Extrair e adicionar a parte do canvas
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

    // Se ainda há conteúdo, adicionar nova página
    if (position < imgHeight) {
      pdf.addPage();
      pageNumber++;
    }
  }
}

/**
 * Opções para geração de PDF
 */
export interface GenerateResumePDFOptions {
  /**
   * Tipo de template a ser usado para gerar o PDF
   * @default ResumeTemplateType.CLASSIC
   */
  templateType?: ResumeTemplateType;

  /**
   * Nome do arquivo PDF (sem extensão)
   * Se não fornecido, será gerado automaticamente
   */
  fileName?: string;

  /**
   * Delay em milissegundos antes de capturar o elemento
   * Útil para garantir que imagens e estilos estejam carregados
   * @default 300
   */
  captureDelay?: number;

  /**
   * Escala da captura (afeta qualidade)
   * Valores maiores = melhor qualidade, mas arquivo maior
   * @default 2
   */
  scale?: number;

  /**
   * Formato do PDF
   * @default 'a4'
   */
  format?: 'a4' | 'letter';

  /**
   * Orientação do PDF
   * @default 'portrait'
   */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Use case: Gera e faz download do PDF do currículo
 * 
 * Captura o elemento HTML do template especificado e converte para PDF.
 * O elemento é temporariamente movido para fora da viewport durante a captura
 * para não interferir na visualização da página.
 * 
 * @param options - Opções de geração do PDF
 * @throws {Error} Se o elemento do currículo não for encontrado
 * 
 * @example
 * ```typescript
 * // Geração básica com template padrão
 * await generateResumePDF();
 * 
 * // Geração com template específico e opções
 * await generateResumePDF({
 *   templateType: ResumeTemplateType.MODERN,
 *   fileName: 'Meu_Curriculo_2024',
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

  // Obter o template e seu ID de elemento
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
    // Salvar estilos originais do elemento e do pai
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

    // Mostrar elemento temporariamente fora da viewport
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

    // Aguardar um momento para garantir que o elemento está renderizado
    // Isso é importante para imagens e fontes carregarem
    await new Promise(resolve => setTimeout(resolve, captureDelay));

    // Detectar seções ANTES de capturar o canvas
    // Isso é necessário porque getBoundingClientRect precisa do elemento visível
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

    // Gerar nome do arquivo se não fornecido
    const finalFileName = fileName ||
      `Resume_${templateType}_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;

    // Fazer download do PDF
    pdf.save(finalFileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

