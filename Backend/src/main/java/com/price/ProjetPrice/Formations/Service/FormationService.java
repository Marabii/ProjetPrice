package com.price.ProjetPrice.Formations.Service;

import com.price.ProjetPrice.Formations.Model.Formation;
import com.price.ProjetPrice.Formations.Repository.FormationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class to handle advanced search, paging, and ranking.
 */
@Service
public class FormationService {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Find all formations (paged).
     */
    public Page<Formation> findAllFormationsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return formationRepository.findAll(pageable);
    }

    /**
     * Find one formation by ID.
     */
    public Formation findById(String id) {
        Optional<Formation> formation = formationRepository.findById(id);
        return formation.orElse(null);
    }

    /**
     * Example: search by region with paging.
     */
    public Page<Formation> searchByRegion(String region, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return formationRepository.findByRegion(region, pageable);
    }

    /**
     * Example: search by establishmentStatus (public/privé) with paging.
     */
    public Page<Formation> searchByEstablishmentStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return formationRepository.findByEstablishmentStatus(status, pageable);
    }

    /**
     * Example: search by program with paging.
     */
    public Page<Formation> searchByProgram(String program, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return formationRepository.findByProgram(program, pageable);
    }

    /**
     * A more advanced search that uses multiple optional parameters.
     * If a parameter is null, it won't be included in the filter.
     *
     * @param region              optional
     * @param department          optional
     * @param establishmentStatus optional
     * @param program             optional
     * @param page                page index
     * @param size                page size
     * @param sortBy              sort field (e.g. "capacity", "accessRate",
     *                            "admittedCount" ...)
     * @param direction           ASC or DESC
     *
     * @return a paged list of matching formations
     */
    public Page<Formation> advancedSearch(
            String region,
            String department,
            String establishmentStatus,
            String program,
            int page,
            int size,
            String sortBy,
            Sort.Direction direction) {
        // Build a dynamic Query with Criteria
        Query query = new Query();

        // If region is specified
        if (region != null && !region.isBlank()) {
            query.addCriteria(Criteria.where("region").is(region));
        }

        // If department is specified
        if (department != null && !department.isBlank()) {
            query.addCriteria(Criteria.where("department").is(department));
        }

        // If establishmentStatus is specified
        if (establishmentStatus != null && !establishmentStatus.isBlank()) {
            query.addCriteria(Criteria.where("establishmentStatus").is(establishmentStatus));
        }

        // If program is specified
        if (program != null && !program.isBlank()) {
            query.addCriteria(Criteria.where("program").is(program));
        }

        // Sort & Paging
        Pageable pageable = PageRequest.of(page, size, direction, (sortBy != null ? sortBy : "id"));

        // Run the query with the constructed criteria and pageable
        long total = mongoTemplate.count(query, Formation.class);
        // For pagination:
        query.with(pageable);
        List<Formation> content = mongoTemplate.find(query, Formation.class);

        // Return as a Page
        return new PageImpl<>(content, pageable, total);
    }

    /**
     * Ranking universities based on a chosen criteria.
     * For example, if the user wants to rank by 'capacity' or 'admittedCount' or
     * 'candidateCount'.
     * This is effectively the same as advancedSearch with a specified sort, but
     * let's
     * make a special method for clarity.
     *
     * @param sortBy    field to sort by (e.g., 'capacity' or 'admittedCount')
     * @param direction ASC or DESC
     * @param page      page index
     * @param size      page size
     */
    public Page<Formation> rankFormations(String sortBy, Sort.Direction direction, int page, int size) {
        // We rely on the repository’s "findAll(Pageable)" method and just specify
        // sorting.
        Pageable pageable = PageRequest.of(page, size, direction, (sortBy != null ? sortBy : "id"));
        return formationRepository.findAll(pageable);
    }

    /**
     * If you need to derive acceptance rate from numeric columns
     * (admittedCount / candidateCount), but the CSV 'accessRate' is a string,
     * you could parse or compute your own ratio. Example below is purely optional.
     */
    public Double computeNumericAcceptanceRate(Formation f) {
        if (f.getCandidateCount() == null || f.getCandidateCount() == 0) {
            return null;
        }
        if (f.getAdmittedCount() == null) {
            return 0.0;
        }
        return (f.getAdmittedCount() * 1.0) / f.getCandidateCount();
    }

    // Save or update
    public Formation saveFormation(Formation formation) {
        return formationRepository.save(formation);
    }

    // Bulk save
    public List<Formation> saveAll(List<Formation> formations) {
        return formationRepository.saveAll(formations);
    }

    public List<Formation> searchFormations(String query) {
        return formationRepository.findTop5ByEstablishmentNameContainingIgnoreCase(query);
    }

    /**
     * Return distinct values of the given field from the "formations" collection,
     * optionally filtered by a "startsWith" query (ignoring case and accents).
     *
     * If query is empty, returns up to 5 possible values.
     * Otherwise, returns all matching the query prefix.
     */
    public List<String> getFieldSuggestions(String field, String query) {
        // Retrieve all distinct values of the given field from Formation
        List<String> allValues = mongoTemplate.query(Formation.class)
                .distinct(field)
                .as(String.class)
                .all();

        // If query is null or empty, return up to 5 items, no filtering
        if (query == null || query.trim().isEmpty()) {
            return allValues.stream()
                    .filter(val -> val != null && !val.isEmpty())
                    .limit(5)
                    .collect(Collectors.toList());
        }

        // Otherwise, filter them by "startsWith" (case- & accent-insensitive)
        String normalizedQuery = removeAccents(query.toLowerCase());

        return allValues.stream()
                .filter(val -> {
                    if (val == null)
                        return false;
                    String normVal = removeAccents(val.toLowerCase());
                    return normVal.startsWith(normalizedQuery);
                })
                .collect(Collectors.toList());
    }

    /**
     * Utility method to remove diacritics (accents)
     * Example: "é" -> "e", "Ê" -> "E", etc.
     */
    private String removeAccents(String input) {
        if (input == null)
            return null;
        // Normalize to decompose accents from letters
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Remove all combining diacritical marks
        return normalized.replaceAll("\\p{M}", "");
    }
}
