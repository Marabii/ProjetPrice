export interface Formation {
  id: string;

  // Establishment details (from fichier_filtre.csv)
  establishmentStatus: string; // Statut de l'établissement de la filière de formation (public, privé…)
  establishmentName: string; // Établissement
  department: string; // Département de l'établissement
  region: string; // Région de l'établissement
  academy: string; // Académie de l'établissement
  commune: string; // Commune de l'établissement

  // Program details (from fichier_filtre.csv)
  program: string; // Filière de formation
  selectivity: string; // Sélectivité

  // Admissions and capacity numbers (from fichier_filtre.csv)
  candidateCount: number; // Effectif total des candidats pour une formation
  admittedBacGeneral: number; // Effectif des admis néo bacheliers généraux
  admittedBacTechno: number; // Effectif des admis néo bacheliers technologiques
  admittedBacPro: number; // Effectif des admis néo bacheliers professionnels

  // Additional metrics (from fichier_filtre.csv)
  generalTerminalOfferPercentage: string; // Part des terminales générales en position de recevoir une proposition
  technoTerminalOfferPercentage: string; // Part des terminales technologiques en position de recevoir une proposition
  professionalTerminalOfferPercentage: string; // Part des terminales professionnelles en position de recevoir une proposition

  // Additional details from ecoles.csv
  duration?: string; // Durée
  cost?: string; // Coût
  privatePublicStatus?: string; // Privé/Public
  domainsOffered?: string; // Domaines enseignés
  website?: string; // Site web
  studentLife?: string; // Vie étudiante
  associations?: string; // Associations (types)
  residenceOptions?: string; // Résidence universitaire/internat
  admissionProcess?: string; // Admission
  atmosphere?: string; // Ambiance
  careerProspects?: string; // Débouchés
  housingInfo?: string; // Logement
  alternanceAvailable?: string; // Alternance dispo
  orientationAdvice?: string; // Conseil orientation/charge

  // Flag to indicate if this formation has detailed information from ecoles.csv
  hasDetailedInfo?: boolean;
}
