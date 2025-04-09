package com.price.ProjetPrice.Auth.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.price.ProjetPrice.Auth.enums.USER_STATUS;
import com.price.ProjetPrice.Auth.models.Users;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends MongoRepository<Users, String> {

    // Find a user by Email
    Optional<Users> findByEmail(String email);

    // Check whether the user exists or not:
    boolean existsById(@NotNull String Id);

    // Find users by first name
    List<Users> findByName(String name);

    // Find users by status
    List<Users> findAllByUserStatus(USER_STATUS status);

    // Check if a user exists by Email
    boolean existsByEmail(String email);

    // Count the number of users with a specific role (assuming Users have a role
    // field)
    long countByRole(String role);

    // Delete a user by Email
    void deleteByEmail(String email);
}
