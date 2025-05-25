package com.musicApp.restAPI.sql.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.persistance.User.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setId(1L);
        testUser.setUsername("testUser");
        testUser.setPassword_hash("password");
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // given
        List<UserEntity> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        // when
        List<UserEntity> result = userService.getAllUsers();

        // then
        assertEquals(1, result.size());
        assertEquals(testUser, result.get(0));
        verify(userRepository).findAll();
    }

    @Test
    void findUserById_ShouldReturnUser() {
        // given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // when
        UserEntity result = userService.findUserById(1L);

        // then
        assertNotNull(result);
        assertEquals(testUser, result);
        verify(userRepository).findById(1L);
    }    @Test
    void addUser_ShouldSaveUser() {
        // given
        String rawPassword = "password";
        String hashedPassword = "hashedPassword";
        testUser.setPassword_hash(rawPassword);
        
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // when
        userService.addUser(testUser);

        // then
        verify(passwordEncoder).encode(rawPassword);
        verify(userRepository).save(argThat(savedUser -> 
            savedUser.getPassword_hash().equals(hashedPassword)
        ));
    }

    @Test
    void updateUser_ShouldUpdateExistingUser() {
        // given
        UserEntity updatedUser = new UserEntity();
        updatedUser.setUsername("updatedUser");
        updatedUser.setPassword_hash("newPassword");
        String hashedPassword = "newHashedPassword";

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(any())).thenReturn(hashedPassword);

        // when
        userService.updateUser(1L, updatedUser);

        // then
        verify(userRepository).findById(1L);
        verify(passwordEncoder).encode(updatedUser.getPassword_hash());
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteUser_ShouldDeleteUser() {
        // when
        userService.deleteUser(1L);

        // then
        verify(userRepository).deleteById(1L);
    }
}
