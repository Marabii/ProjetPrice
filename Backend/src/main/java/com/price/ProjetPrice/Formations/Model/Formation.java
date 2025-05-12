package com.price.ProjetPrice.Formations.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "formations")
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Formation {

    @Id
    private String id;

    // Establishment details (from fichier_filtre.csv)
    private String establishmentStatus; // from "Statut de l'établissement de la filière de formation (public, privé…)"
    private String establishmentName; // from "Établissement"
    private String department; // from "Département de l'établissement"
    private String region; // from "Région de l'établissement"
    private String academy; // from "Académie de l'établissement"
    private String commune; // from "Commune de l'établissement"

    // Program details (from fichier_filtre.csv)
    private String program; // from "Filière de formation"
    private String selectivity; // from "Sélectivité"

    // Admissions and capacity numbers (from fichier_filtre.csv)
    private Integer candidateCount; // from "Effectif total des candidats pour une formation"
    private Integer admittedBacGeneral; // from "Effectif des admis néo bacheliers généraux"
    private Integer admittedBacTechno; // from "Effectif des admis néo bacheliers technologiques"
    private Integer admittedBacPro; // from "Effectif des admis néo bacheliers professionnels"

    // Additional metrics (from fichier_filtre.csv)
    private String generalTerminalOfferPercentage; // from "Part des terminales générales qui étaient en position de
                                                   // recevoir une proposition en phase principale"
    private String technoTerminalOfferPercentage; // from "Part des terminales technologiques qui étaient en position de
                                                  // recevoir une proposition en phase principale"
    private String professionalTerminalOfferPercentage; // from "Part des terminales professionnelles qui étaient en
                                                        // position de recevoir une proposition en phase principale"

    // Additional details from ecoles.csv
    private String duration; // from "Durée"
    private String cost; // from "Coût"
    private String privatePublicStatus; // from "Privé/Public"
    private String domainsOffered; // from "Domaines enseignés"
    private String website; // from "Site web"
    private String studentLife; // from "Vie étudiante"
    private String associations; // from "Associations (types)"
    private String residenceOptions; // from "Résidence universitaire/internat"
    private String admissionProcess; // from "Admission"
    private String atmosphere; // from "Ambiance"
    private String careerProspects; // from "Débouchés"
    private String housingInfo; // from "Logement"
    private String alternanceAvailable; // from "Alternance dispo"
    private String orientationAdvice; // from "Conseil orientation/charge"

    // Flag to indicate if this formation has detailed information from ecoles.csv
    private Boolean hasDetailedInfo;
}
