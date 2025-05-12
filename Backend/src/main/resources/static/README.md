# CSV Merger for GlobalPriceTracker

This tool merges data from two CSV files:

1. `fichier_filtre.csv` - Contains basic details for 258 universities
2. `ecoles.csv` - Contains more in-depth information for 50 universities (which are a subset of the 258)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to this directory:

   ```
   cd /path/to/projetPrice/Backend/src/main/resources/static
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Run the merging script:

   ```
   npm run merge
   ```

2. The script will:
   - Read both CSV files
   - Merge them based on university names
   - Output a single JSON file called `merged_formations.json`
   - Log any universities from `ecoles.csv` that couldn't be matched in `fichier_filtre.csv`
   - Create a file called `unmatched_ecoles.json` with the list of unmatched universities

## Importing to MongoDB

After generating the merged JSON file, you can import it into MongoDB using the following command:

```
mongoimport --db projetPrice --collection formations --file merged_formations.json --jsonArray --drop
```

This will:

- Connect to the MongoDB database named `projetPrice`
- Import the data into the `formations` collection
- Drop the existing collection if it exists

## Data Model

The merged data follows this structure:

```typescript
interface Formation {
  // Basic details (from fichier_filtre.csv)
  establishmentStatus: string;
  establishmentName: string;
  department: string;
  region: string;
  academy: string;
  commune: string;

  // Program details (from fichier_filtre.csv)
  program: string;
  selectivity: string;

  // Admissions and capacity numbers (from fichier_filtre.csv)
  candidateCount: number;
  admittedBacGeneral: number;
  admittedBacTechno: number;
  admittedBacPro: number;

  // Additional metrics (from fichier_filtre.csv)
  generalTerminalOfferPercentage: string;
  technoTerminalOfferPercentage: string;
  professionalTerminalOfferPercentage: string;

  // Additional details (from ecoles.csv)
  duration?: string;
  cost?: string;
  privatePublicStatus?: string;
  domainsOffered?: string;
  website?: string;
  studentLife?: string;
  associations?: string;
  residenceOptions?: string;
  admissionProcess?: string;
  atmosphere?: string;
  careerProspects?: string;
  housingInfo?: string;
  alternanceAvailable?: string;
  orientationAdvice?: string;

  // Flag to indicate if this formation has detailed information
  hasDetailedInfo: boolean;
}
```

## Troubleshooting

If you encounter any issues:

1. Make sure both CSV files are in the correct location
2. Check that the CSV files have the expected headers
3. Verify that Node.js and npm are installed correctly
4. Check for any error messages in the console output

## Notes

- The script uses a normalization function to improve matching between university names
- Universities are matched based on their names after removing accents, spaces, and special characters
- If a university from `ecoles.csv` can't be matched, it will be logged but not included in the merged data
