package com.musicApp.restAPI.service;

import com.musicApp.restAPI.persistance.User.UserEntity;
import com.musicApp.restAPI.persistance.User.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder){
        this.userRepository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    // get all users
    public List<UserEntity> getAllUsers(){
        return this.userRepository.findAll();
    }

    // find user by its id
    public UserEntity findUserById(Long id){
        return this.userRepository.findById(id).get();
    }

    // add new user
    public void addUser(UserEntity user){
        // hash the password
        user.setPassword_hash(passwordEncoder.encode(user.getPassword_hash()));

        this.userRepository.save(user);
    }

    // update user
    public void updateUser(Long id, UserEntity user){
        Optional<UserEntity> userOpt = this.userRepository.findById(id);
        if(userOpt.isPresent()){
            userOpt.get().setUsername(user.getUsername());
            userOpt.get().setPassword_hash(passwordEncoder.encode(user.getPassword_hash()));
            this.userRepository.save(userOpt.get());
        }
    }

    // delete user
    public void deleteUser(Long id){
        this.userRepository.deleteById(id);
    }
}
