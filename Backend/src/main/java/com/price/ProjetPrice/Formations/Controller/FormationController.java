package com.price.ProjetPrice.Formations.Controller;

import com.price.ProjetPrice.Formations.Model.Formation;
import com.price.ProjetPrice.Formations.Service.FormationService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/formations")
public class FormationController {

    @Autowired
    private FormationService formationService;

    /**
     * Get a paged list of all formations.
     * Example: GET /api/formations/all?page=0&size=10
     */
    @GetMapping("/all")
    public Page<Formation> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return formationService.findAllFormationsPaged(page, size);
    }

    /**
     * Get a suggestions of insitutions based on a query.
     * Example: GET /api/formations/search?query=mine
     */
    @GetMapping("/search")
    public List<Formation> searchFormations(
            @RequestParam String query) {
        return formationService.searchFormations(query);
    }

    /**
     * Get a formation by its ID.
     */
    @GetMapping("/{id}")
    public Formation getFormationById(@PathVariable String id) {
        return formationService.findById(id);
    }

    /**
     * Search by region, with paging:
     * GET /api/formations/search/region?value=Île-de-France&page=0&size=10
     */
    @GetMapping("/search/region")
    public Page<Formation> searchByRegion(
            @RequestParam String value,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return formationService.searchByRegion(value, page, size);
    }

    /**
     * Search by public/privé, with paging:
     * GET /api/formations/search/status?value=public&page=0&size=10
     */
    @GetMapping("/search/status")
    public Page<Formation> searchByEstablishmentStatus(
            @RequestParam String value,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return formationService.searchByEstablishmentStatus(value, page, size);
    }

    /**
     * Search by program, with paging:
     * GET /api/formations/search/program?value=CPGE&page=0&size=10
     */
    @GetMapping("/search/program")
    public Page<Formation> searchByProgram(
            @RequestParam String value,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return formationService.searchByProgram(value, page, size);
    }

    /**
     * Advanced search with multiple possible filters and sorting:
     * GET
     * /api/formations/advancedSearch?region=Île-de-France&program=CPGE&bacType=general&sortBy=capacity&direction=DESC&page=0&size=10
     */
    @GetMapping("/advancedSearch")
    public Page<Formation> advancedSearch(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String establishmentStatus,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String bacType,
            @RequestParam(required = false) Boolean hasDetailedInfo,
            @RequestParam(required = false) String alternanceAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return formationService.advancedSearch(
                region, department, establishmentStatus, program, bacType,
                hasDetailedInfo, alternanceAvailable, page, size, sortBy, sortDirection);
    }

    /**
     * Ranking endpoint: rank by a specific field (e.g., 'capacity',
     * 'admittedCount', 'candidateCount', etc.)
     * GET /api/formations/rank?sortBy=capacity&direction=DESC&page=0&size=10
     */
    @GetMapping("/rank")
    public Page<Formation> rankFormations(
            @RequestParam(defaultValue = "capacity") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return formationService.rankFormations(sortBy, sortDirection, page, size);
    }

    /**
     * Example usage:
     * GET /api/formations/suggestions?field=establishmentStatus&query=pub
     *
     * @param field The DB field to retrieve distinct suggestions from (e.g.
     *              "establishmentStatus")
     * @param query (Optional) The partial text to filter by (ignore case &
     *              accents).
     * @return List of up to 5 items if query is empty, or all items starting with
     *         the query.
     */
    @GetMapping("/suggestions")
    public List<String> getFieldSuggestions(
            @RequestParam String field,
            @RequestParam(required = false) String query) {

        return formationService.getFieldSuggestions(field, query);
    }
}
