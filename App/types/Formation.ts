export interface Formation {
  id: string;

  // Establishment details
  establishmentStatus: string; // Statut de l’établissement de la filière de formation (public, privé…)
  establishmentName: string; // Établissement
  department: string; // Département de l’établissement
  region: string; // Région de l’établissement
  academy: string; // Académie de l’établissement
  commune: string; // Commune de l’établissement

  // Program details
  program: string; // Filière de formation
  selectivity: string; // Sélectivité

  // Admissions and capacity numbers
  capacity: number; // Capacité de l’établissement par formation
  candidateCount: number; // Effectif total des candidats pour une formation
  admissionOfferCount: number; // Effectif total des candidats ayant reçu une proposition d’admission
  admittedCount: number; // Effectif total des candidats ayant accepté la proposition (admis)
  admittedNeoBac: number; // Effectif des admis néo bacheliers
  admittedBacGeneral: number; // Effectif des admis néo bacheliers généraux
  admittedBacTechno: number; // Effectif des admis néo bacheliers technologiques
  admittedBacPro: number; // Effectif des admis néo bacheliers professionnels

  // Additional metrics
  accessRate: string; // Taux d’accès
  generalTerminalOfferPercentage: string; // Part des terminales générales en position de recevoir une proposition
  technoTerminalOfferPercentage: string; // Part des terminales technologiques en position de recevoir une proposition
  professionalTerminalOfferPercentage: string; // Part des terminales professionnelles en position de recevoir une proposition
}
