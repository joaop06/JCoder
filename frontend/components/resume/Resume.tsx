'use client';

import {
  UserComponentAboutMe,
  UserComponentEducation,
  UserComponentExperience,
  UserComponentCertificate,
  UserComponentReference,
  Technology,
  User,
} from "@/types";
import { ResumeData, ResumeTemplateType } from "./types";
import { getResumeTemplate } from "./templates";

interface ResumeProps {
  aboutMe: UserComponentAboutMe | null;
  educations: UserComponentEducation[];
  experiences: UserComponentExperience[];
  certificates: UserComponentCertificate[];
  references: UserComponentReference[];
  technologies: Technology[];
  user?: User | null;
  /**
   * Tipo de template a ser usado
   * @default ResumeTemplateType.CLASSIC
   */
  templateType?: ResumeTemplateType;
}

/**
 * Componente principal de currículo
 * 
 * Renderiza o currículo usando o template especificado.
 * Por padrão, usa o template CLASSIC.
 * 
 * @example
 * ```tsx
 * <Resume
 *   user={user}
 *   aboutMe={aboutMe}
 *   educations={educations}
 *   experiences={experiences}
 *   certificates={certificates}
 *   references={references}
 *   technologies={technologies}
 *   templateType={ResumeTemplateType.CLASSIC}
 * />
 * ```
 */
export default function Resume({
  aboutMe,
  educations,
  experiences,
  certificates,
  references,
  technologies,
  user,
  templateType = ResumeTemplateType.MODERN,
}: ResumeProps) {
  // Preparar dados do currículo
  const resumeData: ResumeData = {
    aboutMe,
    educations,
    experiences,
    certificates,
    references,
    technologies,
    user,
  };

  // Obter o template
  const template = getResumeTemplate(templateType);
  const TemplateComponent = template.Component;

  // Renderizar o template
  return <TemplateComponent data={resumeData} />;
}

// Re-exportar função de geração de PDF
export { generateResumePDF } from './use-cases/generateResumePDF';
export type { GenerateResumePDFOptions } from './use-cases/generateResumePDF';
