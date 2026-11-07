export interface ArticleDTO {
  articleId: number;
  article: string;
}

export interface ArticleTacheDTO {
  id: string;
  quantite: number;
  articleId: number;
  article: string;
}

export interface TacheDTO {
  tacheId: string;
  titre: string;
  createAt: string;
  updatedAt: string;
  nom_technicien: string | null;
  articlesTache: ArticleTacheDTO[];
}

export interface RaccordementSoutraitantDTO {
  raccordementID: string;
  crm: string;
  etat: string;
  nomChef: string;
  dateRDV: string;
  heureRDV: string;
  taches: TacheDTO[];
}

export interface DataAttachamentDTO {
  articles: ArticleDTO[];
  raccordementSoutraitantDTOS: RaccordementSoutraitantDTO[];
}



export interface Soutraitance {
  id: string;
  label: string;
}

export interface Operateur {
  id: number;
  nomOperateur: string;
}
export interface AttachementTableRow {
  raccordementID: string;
  crm: string;
  etat: string;
  nomChef: string;
  dateRDV: string;
  heureRDV: string;

  articles: {
    [articleId: number]: number;
  };
}

