export type ModuleId = 'intro' | 'mod1' | 'mod2' | 'mod3' | 'mod4' | 'mod5' | 'mod6' | 'mod7' | 'mod8' | 'mod9';

export interface Subtopic {
  id: string;
  title: string;
  concept: string;
  steps: string[];
  tips?: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  fields: {
    label: string;
    key: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: string;
}

export interface CourseModule {
  id: ModuleId;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  subtopics: Subtopic[];
  challenges: Challenge[];
  checklistItems: ChecklistItem[];
}

export interface UserProgress {
  completedModules: string[];
  completedLessons: string[];
  checklistStates: Record<string, boolean>;
  challengeDrafts: Record<string, Record<string, string>>;
  notes: Record<string, string>;
  scriptEditorAudio: string;
  scriptEditorVideo: string;
  activeTab: Record<string, 'teoria' | 'pratica' | 'desafio' | 'checklist'>;
}
