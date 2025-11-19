/**
 * Módulo de currículo
 * 
 * Este módulo fornece um sistema extensível de templates de currículo
 * com suporte para geração de PDF.
 */

// Componente principal
export { default as Resume } from './Resume';

// Use cases
export { generateResumePDF } from './use-cases/generateResumePDF';
export type { GenerateResumePDFOptions } from './use-cases/generateResumePDF';

// Types
export type {
  ResumeData,
  ResumeTemplateProps,
  ResumeTemplate,
  ResumeTemplateMetadata,
} from './types';
export { ResumeTemplateType } from './types';

// Templates registry
export {
  getResumeTemplate,
  getAllResumeTemplates,
  getAllResumeTemplateMetadata,
} from './templates';

// Utils
export {
  formatDate,
  formatDateRange,
  getExpertiseLevelLabel,
  stripHtml,
  getSkillBarWidth,
} from './utils';

