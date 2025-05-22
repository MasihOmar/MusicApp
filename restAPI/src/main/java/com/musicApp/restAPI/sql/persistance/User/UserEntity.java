package com.musicApp.restAPI.sql.persistance.User;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String username;

    private String password_hash;
}
