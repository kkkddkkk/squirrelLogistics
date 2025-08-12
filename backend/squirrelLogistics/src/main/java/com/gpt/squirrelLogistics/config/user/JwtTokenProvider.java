package com.gpt.squirrelLogistics.config.user;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
  private final Key key = Keys.hmacShaKeyFor("very-secret-key-change-me-please-256bit!".getBytes());
  private final long EXPIRATION = 1000L * 60 * 60 * 2; // 2h

  public String generateToken(String username, String role, Long userId) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + EXPIRATION);
    return Jwts.builder()
      .setSubject(username)
      .claim("role", role)
      .claim("uid", userId)
      .setIssuedAt(now).setExpiration(exp)
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public Jws<Claims> parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
  }
  public String getUsername(String token){ return parse(token).getBody().getSubject(); }
}