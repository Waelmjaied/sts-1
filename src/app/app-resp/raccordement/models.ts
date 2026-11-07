export interface Zone {
  id: number;
  nomZone: string;
}

export interface Projet {
  id: number;
  nomProjet: string;
  zones: Zone[];
}

export interface Operateur {
  id: number;
  nomOperateur: string;
}

export interface InterventionExportDTO {
  label?: string;
  zoneLabel?: string;
  adresse?: string;
  nomClient?: string;
  snont?: string;
  msisdn?: string;
  equipe?: string;
  dateRDV?: string;
  chefEquipe?: string;
  techniciens?: string;
  snBox?: string;
}

export interface RaccordementListItemDTO {
  clientId: string;
  titre: string;
  projet: string;
  zone: string;
  nomClient: string;
  prenomClient: string;
  numTelephone: string;
  numFixe: string;
  adresseClient: string;
  chef_equipe: string;
  dateRDV: string;
  heureRDV: string;
  etatRaccordement: string;
  debit: string;
  intervention?: InterventionExportDTO;
}

export interface RaccordementExportRow {
  label: string;
  zoneLabel: string;
  adresse: string;
  nomClient: string;
  snont: string;
  msisdn: string;
  equipe: string;
  dateRDV: string;
  chefEquipe: string;
  techniciens: string;
  snBox: string;
  etat: string;
}

export interface AppliedFilter {
  label: string;
  value: string;
}

