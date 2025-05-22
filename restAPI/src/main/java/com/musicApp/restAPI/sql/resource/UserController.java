package com.musicApp.restAPI.sql.resource;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping(value = "/users")
    public List<UserEntity> getAllUsers(){
        return this.userService.getAllUsers();
    }

    @GetMapping(value = "/users/{id}")
    public UserEntity findUserById(@PathVariable Long id){
        return this.userService.findUserById(id);
    }

    @PostMapping(value = "/users/add")
    public void addUser(@RequestBody UserEntity user){
        this.userService.addUser(user);
    }

    @PutMapping(value = "/users/update/{id}")
    public void updateUser(@PathVariable Long id, @RequestBody UserEntity user){
        this.userService.updateUser(id, user);
    }

    @DeleteMapping(value = "/users/delete/{id}")
    public void deleteUser(@PathVariable Long id){
        this.userService.deleteUser(id);
    }
}
