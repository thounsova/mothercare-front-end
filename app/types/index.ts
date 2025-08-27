export interface Program {
  id: number;
  name: string;
  icon?: string;
}

export interface ResidentProgram {
  id: number;
  resident: {
    id: number;
    full_name: string;
    avatar?: string;
  };
}

export interface ProgramSkill {
  id: number;
  name: string;
}

export interface ProgramStatus {
  id: number;
  label: string;
}

export interface ResidentField {
  id?: number;
  program_skill_id: number;
  status_id: number;
  comment: string;
  date: string;
  resident_field_id: number;
}
