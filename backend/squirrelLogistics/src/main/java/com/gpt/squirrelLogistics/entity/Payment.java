package com.gpt.squirrelLogistics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Payment {
	 @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	  private Long id;
}
