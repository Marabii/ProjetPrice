package com.price.ProjetPrice.Model;

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

    // Establishment details
    private String establishmentStatus; // from "Statut de l’établissement de la filière de formation (public, privé…)"
    private String establishmentName; // from "Établissement"
    private String department; // from "Département de l’établissement"
    private String region; // from "Région de l’établissement"
    private String academy; // from "Académie de l’établissement"
    private String commune; // from "Commune de l’établissement"

    // Program details
    private String program; // from "Filière de formation"
    private String selectivity; // from "Sélectivité"

    // Admissions and capacity numbers
    private Integer capacity; // from "Capacité de l’établissement par formation"
    private Integer candidateCount; // from "Effectif total des candidats pour une formation"
    private Integer admissionOfferCount; // from "Effectif total des candidats ayant reçu une proposition d’admission de
                                         // la part de l’établissement"
    private Integer admittedCount; // from "Effectif total des candidats ayant accepté la proposition de
                                   // l’établissement (admis)"
    private Integer admittedNeoBac; // from "Dont effectif des admis néo bacheliers"
    private Integer admittedBacGeneral; // from "Effectif des admis néo bacheliers généraux"
    private Integer admittedBacTechno; // from "Effectif des admis néo bacheliers technologiques"
    private Integer admittedBacPro; // from "Effectif des admis néo bacheliers professionnels"

    // Additional metrics
    private String accessRate; // from "Taux d’accès"
    private String generalTerminalOfferPercentage; // from "Part des terminales générales qui étaient en position de
                                                   // recevoir une proposition en phase principale"
    private String technoTerminalOfferPercentage; // from "Part des terminales technologiques qui étaient en position de
                                                  // recevoir une proposition en phase principale"
    private String professionalTerminalOfferPercentage; // from "Part des terminales professionnelles qui étaient en
                                                        // position de recevoir une proposition en phase principale"

}
