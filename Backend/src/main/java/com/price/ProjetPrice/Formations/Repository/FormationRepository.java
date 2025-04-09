package com.price.ProjetPrice.Formations.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.price.ProjetPrice.Formations.Model.Formation;

public interface FormationRepository extends MongoRepository<Formation, String> {
        // This method now returns at most 5 documents
        List<Formation> findTop5ByEstablishmentNameContainingIgnoreCase(String query);

        // Simple exact-match finders with paging
        Page<Formation> findByRegion(String region, Pageable pageable);

        Page<Formation> findByEstablishmentStatus(String establishmentStatus, Pageable pageable);

        Page<Formation> findByProgram(String program, Pageable pageable);

        Page<Formation> findByDepartment(String department, Pageable pageable);

        // If you want to do partial matches (e.g., "contains" or "regex"):
        @Query("{ 'establishmentName': { $regex: ?0, $options: 'i' } }")
        Page<Formation> findByEstablishmentNameRegex(String name, Pageable pageable);

        // (Here, we do region + program + a capacity > threshold as an example)
        @Query("{ "
                        + " $and: ["
                        + "   { 'region': ?0 }, "
                        + "   { 'program': ?1 }, "
                        + "   { 'capacity': { $gt: ?2 } } "
                        + " ]"
                        + "}")
        Page<Formation> findByRegionAndProgramAndCapacityGreaterThan(
                        String region,
                        String program,
                        int capacityThreshold,
                        Pageable pageable);
}
