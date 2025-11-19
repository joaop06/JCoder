import { ExpertiseLevel } from "@/types";

/**
 * Formata uma data para exibição
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(dateObj);
};

/**
 * Formata um intervalo de datas
 */
export const formatDateRange = (
  startDate: Date | string,
  endDate?: Date | string,
  isCurrent?: boolean
): string => {
  const start = formatDate(startDate);
  if (isCurrent) {
    return `${start} - Present`;
  }
  if (endDate) {
    return `${start} - ${formatDate(endDate)}`;
  }
  return start;
};

/**
 * Retorna o label do nível de expertise
 */
export const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
  const labels: Record<ExpertiseLevel, string> = {
    [ExpertiseLevel.BASIC]: 'Basic',
    [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
    [ExpertiseLevel.ADVANCED]: 'Advanced',
    [ExpertiseLevel.EXPERT]: 'Expert',
  };
  return labels[level];
};

/**
 * Remove tags HTML de uma string
 */
export const stripHtml = (html: string | undefined): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

/**
 * Calcula a porcentagem de preenchimento da barra de skill baseado no nível
 */
export const getSkillBarWidth = (level: ExpertiseLevel): string => {
  switch (level) {
    case ExpertiseLevel.EXPERT:
      return '100%';
    case ExpertiseLevel.ADVANCED:
      return '85%';
    case ExpertiseLevel.INTERMEDIATE:
      return '65%';
    case ExpertiseLevel.BASIC:
      return '40%';
    default:
      return '40%';
  }
};

