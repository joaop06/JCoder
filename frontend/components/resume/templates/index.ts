import { ResumeTemplate, ResumeTemplateType } from '../types';
import ClassicTemplate from './classic/ClassicTemplate';
import ModernTemplate from './modern/ModernTemplate';

/**
 * Registry de templates de currículo
 * Adicione novos templates aqui
 */
export const resumeTemplates: Record<ResumeTemplateType, ResumeTemplate> = {
  // [ResumeTemplateType.CLASSIC]: {
  //   metadata: {
  //     id: ResumeTemplateType.CLASSIC,
  //     name: 'Classic',
  //     description: 'Layout clássico com sidebar azul escuro e conteúdo principal branco',
  //   },
  //   Component: ClassicTemplate,
  //   getResumeElementId: (type) => {
  //     if (type === ResumeTemplateType.CLASSIC) {
  //       return 'resume-content-classic';
  //     }
  //     return `resume-content-${type}`;
  //   },
  // },
  [ResumeTemplateType.MODERN]: {
    metadata: {
      id: ResumeTemplateType.MODERN,
      name: 'Modern',
      description: 'Design moderno e profissional com header destacado e layout vertical limpo',
    },
    Component: ModernTemplate,
    getResumeElementId: (type) => {
      if (type === ResumeTemplateType.MODERN) {
        return 'resume-content-modern';
      }
      return `resume-content-${type}`;
    },
  },
};

/**
 * Obtém um template pelo tipo
 */
export const getResumeTemplate = (type: ResumeTemplateType): ResumeTemplate => {
  const template = resumeTemplates[type];
  if (!template) {
    throw new Error(`Template "${type}" não encontrado`);
  }
  return template;
};

/**
 * Obtém todos os templates disponíveis
 */
export const getAllResumeTemplates = (): ResumeTemplate[] => {
  return Object.values(resumeTemplates);
};

/**
 * Obtém os metadados de todos os templates
 */
export const getAllResumeTemplateMetadata = () => {
  return Object.values(resumeTemplates).map(t => t.metadata);
};

