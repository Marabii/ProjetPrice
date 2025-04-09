package com.price.ProjetPrice.Auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.price.ProjetPrice.Auth.enums.USER_STATUS;
import com.price.ProjetPrice.Auth.exceptions.UserNotFoundException;
import com.price.ProjetPrice.Auth.models.Users;
import com.price.ProjetPrice.Auth.repository.UsersRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsersService {
    private final UsersRepository repository;

    public Users updateUserStatus(Map<String, String> userIdObj) {
        String userId = userIdObj.get("userId");
        Users user = repository.findById(userId).orElseThrow(() -> new UserNotFoundException("incorrect userid"));
        user.setUserStatus(USER_STATUS.ONLINE);
        return repository.save(user);
    }

    public Users disconnect(String userEmail) {
        var storedUser = repository.findByEmail(userEmail).orElse(null);
        if (storedUser != null) {
            storedUser.setUserStatus(USER_STATUS.OFFLINE);
            return repository.save(storedUser);
        }
        return null;
    }

    public List<Users> findConnectedUsers() {
        return repository.findAllByUserStatus(USER_STATUS.ONLINE);
    }

    public Map<String, Object> getUserInfoByEmail(String userEmail) {
        Users user = repository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found, please create account"));
        Map<String, Object> filteredUser = new HashMap<>();
        filteredUser.put("createdAt", user.getCreatedAt());
        filteredUser.put("name", user.getName());
        filteredUser.put("email", user.getEmail());
        filteredUser.put("profilePicture", user.getProfilePicture());
        filteredUser.put("_id", user.get_id());
        filteredUser.put("contacts", user.getContacts());
        return filteredUser;
    }

    public Map<String, Object> getUserInfoById(String userEmail) {
        Users user = repository.findById(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found, please create account"));
        Map<String, Object> filteredUser = new HashMap<>();
        filteredUser.put("createdAt", user.getCreatedAt());
        filteredUser.put("name", user.getName());
        filteredUser.put("email", user.getEmail());
        filteredUser.put("profilePicture", user.getProfilePicture());
        filteredUser.put("_id", user.get_id());
        filteredUser.put("contacts", user.getContacts());
        return filteredUser;
    }
}
