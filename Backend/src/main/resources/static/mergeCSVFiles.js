const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Paths to the CSV files
const fichierFiltrePath = path.join(__dirname, "fichier_filtre.csv");
const ecolesPath = path.join(__dirname, "ecoles.csv");
const outputPath = path.join(__dirname, "merged_formations.json");

// Arrays to store the data from each CSV file
const fichierFiltreData = [];
const ecolesData = [];

// Function to normalize establishment names for better matching
function normalizeEstablishmentName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric characters
    .trim();
}

// Read the fichier_filtre.csv file
fs.createReadStream(fichierFiltrePath)
  .pipe(csv())
  .on("data", (data) => {
    fichierFiltreData.push(data);
  })
  .on("end", () => {
    console.log(
      `Read ${fichierFiltreData.length} records from fichier_filtre.csv`
    );

    // Read the ecoles.csv file
    fs.createReadStream(ecolesPath)
      .pipe(csv())
      .on("data", (data) => {
        ecolesData.push(data);
      })
      .on("end", () => {
        console.log(`Read ${ecolesData.length} records from ecoles.csv`);

        // Merge the data
        const mergedData = mergeData(fichierFiltreData, ecolesData);

        // Write the merged data to a JSON file
        fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
        console.log(`Merged data written to ${outputPath}`);
      });
  });

// Function to merge the data from both CSV files
function mergeData(fichierFiltreData, ecolesData) {
  const mergedData = [];
  const unmatchedEcoles = [];

  // Create a map of normalized establishment names to their original data from ecoles.csv
  const ecolesMap = new Map();
  ecolesData.forEach((ecole) => {
    const normalizedName = normalizeEstablishmentName(ecole["Établissement"]);
    ecolesMap.set(normalizedName, ecole);
  });

  // Process each record from fichier_filtre.csv
  fichierFiltreData.forEach((formation) => {
    const normalizedName = normalizeEstablishmentName(
      formation["Établissement"]
    );
    const ecole = ecolesMap.get(normalizedName);

    // Create a merged record
    const mergedRecord = {
      // Basic details from fichier_filtre.csv
      establishmentStatus:
        formation[
          "Statut de l'établissement de la filière de formation (public, privé…)"
        ],
      establishmentName: formation["Établissement"],
      department: formation["Département de l'établissement"],
      region: formation["Région de l'établissement"],
      academy: formation["Académie de l'établissement"],
      commune: formation["Commune de l'établissement"],

      // Program details from fichier_filtre.csv
      program: formation["Filière de formation"],
      selectivity: formation["Sélectivité"],

      // Admissions and capacity numbers from fichier_filtre.csv
      candidateCount:
        parseInt(
          formation["Effectif total des candidats pour une formation"]
        ) || 0,
      admittedBacGeneral:
        parseInt(formation["Effectif des admis néo bacheliers généraux"]) || 0,
      admittedBacTechno:
        parseInt(
          formation["Effectif des admis néo bacheliers technologiques"]
        ) || 0,
      admittedBacPro:
        parseInt(
          formation["Effectif des admis néo bacheliers professionnels"]
        ) || 0,

      // Additional metrics from fichier_filtre.csv
      generalTerminalOfferPercentage:
        formation[
          "Part des terminales générales qui étaient en position de recevoir une proposition en phase principale"
        ],
      technoTerminalOfferPercentage:
        formation[
          "Part des terminales technologiques qui étaient en position de recevoir une proposition en phase principale"
        ],
      professionalTerminalOfferPercentage:
        formation[
          "Part des terminales professionnelles qui étaient en position de recevoir une proposition en phase principale"
        ],

      // Flag to indicate if this formation has detailed information from ecoles.csv
      hasDetailedInfo: !!ecole,
    };

    // Add additional details from ecoles.csv if available
    if (ecole) {
      mergedRecord.duration = ecole["Durée"];
      mergedRecord.cost = ecole["Coût"];
      mergedRecord.privatePublicStatus = ecole["Privé/Public"];
      mergedRecord.domainsOffered = ecole["Domaines enseignés"];
      mergedRecord.website = ecole["Site web"];
      mergedRecord.studentLife = ecole["Vie étudiante"];
      mergedRecord.associations = ecole["Associations (types)"];
      mergedRecord.residenceOptions = ecole["Résidence universitaire/internat"];
      mergedRecord.admissionProcess = ecole["Admission"];
      mergedRecord.atmosphere = ecole["Ambiance"];
      mergedRecord.careerProspects = ecole["Débouchés"];
      mergedRecord.housingInfo = ecole["Logement"];
      mergedRecord.alternanceAvailable = ecole["Alternance dispo"];
      mergedRecord.orientationAdvice = ecole["Conseil orientation/charge"];
    }

    mergedData.push(mergedRecord);
  });

  // Find ecoles that weren't matched
  ecolesData.forEach((ecole) => {
    const normalizedName = normalizeEstablishmentName(ecole["Établissement"]);
    let found = false;

    for (const formation of fichierFiltreData) {
      if (
        normalizeEstablishmentName(formation["Établissement"]) ===
        normalizedName
      ) {
        found = true;
        break;
      }
    }

    if (!found) {
      unmatchedEcoles.push(ecole["Établissement"]);
    }
  });

  // Log unmatched ecoles
  if (unmatchedEcoles.length > 0) {
    console.log(
      "The following universities from ecoles.csv could not be matched in fichier_filtre.csv:"
    );
    unmatchedEcoles.forEach((name) => console.log(`- ${name}`));

    // Also write to a file
    fs.writeFileSync(
      path.join(__dirname, "unmatched_ecoles.json"),
      JSON.stringify(unmatchedEcoles, null, 2)
    );
  }

  return mergedData;
}
