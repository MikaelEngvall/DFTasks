package com.dftasks.controller;

import com.dftasks.dto.AuthenticationRequest;
import com.dftasks.dto.AuthenticationResponse;
import com.dftasks.dto.RegisterRequest;
import com.dftasks.model.User;
import com.dftasks.security.JwtService;
import com.dftasks.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.createUser(User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(request.getRole())
                .build());

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(token)
                .user(user)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(token)
                .user(user)
                .build());
    }
} 