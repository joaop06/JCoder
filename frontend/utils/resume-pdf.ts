import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateResumePDF(): Promise<void> {
  const resumeElement = document.getElementById('resume-content');
  
  if (!resumeElement) {
    throw new Error('Resume content not found');
  }

  try {
    // Guardar estilos originais
    const parentElement = resumeElement.parentElement;
    const originalParentDisplay = parentElement?.style.display || '';
    const originalDisplay = resumeElement.style.display;
    const originalPosition = resumeElement.style.position;
    const originalLeft = resumeElement.style.left;
    const originalTop = resumeElement.style.top;
    const originalZIndex = resumeElement.style.zIndex;
    const originalOpacity = resumeElement.style.opacity;
    const originalVisibility = resumeElement.style.visibility;

    // Mostrar o elemento temporariamente fora da viewport
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

    // Aguardar um momento para garantir que o elemento está renderizado
    await new Promise(resolve => setTimeout(resolve, 200));

    // Criar canvas do HTML
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight,
      windowWidth: resumeElement.scrollWidth,
      windowHeight: resumeElement.scrollHeight,
    });

    // Restaurar estilos originais
    if (parentElement) {
      parentElement.style.display = originalParentDisplay;
      parentElement.style.position = '';
      parentElement.style.left = '';
      parentElement.style.top = '';
      parentElement.style.zIndex = '';
    }
    resumeElement.style.display = originalDisplay;
    resumeElement.style.position = originalPosition;
    resumeElement.style.left = originalLeft;
    resumeElement.style.top = originalTop;
    resumeElement.style.zIndex = originalZIndex;
    resumeElement.style.opacity = originalOpacity;
    resumeElement.style.visibility = originalVisibility;

    // Calcular dimensões do PDF (A4)
    const pdfWidth = 210; // mm
    const pdfHeight = 297; // mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Criar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar primeira página
    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Adicionar páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Baixar o PDF
    const fileName = `Resume_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

