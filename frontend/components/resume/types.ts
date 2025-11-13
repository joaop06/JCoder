import {
  User,
  Technology,
  UserComponentAboutMe,
  UserComponentEducation,
  UserComponentExperience,
  UserComponentCertificate,
  UserComponentReference,
} from "@/types";

/**
 * Dados do currículo que são passados para os templates
 */
export interface ResumeData {
  aboutMe: UserComponentAboutMe | null;
  educations: UserComponentEducation[];
  experiences: UserComponentExperience[];
  certificates: UserComponentCertificate[];
  references: UserComponentReference[];
  technologies: Technology[];
  user?: User | null;
}

/**
 * Propriedades que um template de currículo deve receber
 */
export interface ResumeTemplateProps {
  data: ResumeData;
}

/**
 * Tipo de template disponível
 */
export enum ResumeTemplateType {
  // CLASSIC = 'classic',
  MODERN = 'modern',
  // Futuros templates podem ser adicionados aqui:
  // MINIMAL = 'minimal',
  // CREATIVE = 'creative',
}

/**
 * Metadados de um template
 */
export interface ResumeTemplateMetadata {
  id: ResumeTemplateType;
  name: string;
  description: string;
  preview?: string; // URL da imagem de preview
}

/**
 * Interface que todos os templates devem implementar
 */
export interface ResumeTemplate {
  /**
   * Metadados do template
   */
  metadata: ResumeTemplateMetadata;

  /**
   * Componente React que renderiza o template
   */
  Component: React.ComponentType<ResumeTemplateProps>;

  /**
   * ID do elemento que será capturado para PDF (deve ser único)
   */
  getResumeElementId: (templateType: ResumeTemplateType) => string;
}

