export interface UserProfile {
  nome: string | null;
  email: string | null;
  telefone: string | null;
  created_at: string;
}

export interface Workspace {
  id: number
  nome: string
  descricao: string | null
  created_at: string
  avatar?: string
}
