package com.gpt.squirrelLogistics.common;

import java.util.List;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;

public class LatLngListJsonConverter implements AttributeConverter<List<LatLng>, String> {
	 private static final ObjectMapper M = new ObjectMapper();
	    static {
	        M.findAndRegisterModules(); // BigDecimal 등
	        M.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);
	    }

	    @Override
	    public String convertToDatabaseColumn(List<LatLng> attribute) {
	        try { return attribute == null ? null : M.writeValueAsString(attribute); }
	        catch (Exception e) { throw new IllegalArgumentException("serialize List<LatLng>", e); }
	    }

	    @Override
	    public List<LatLng> convertToEntityAttribute(String dbData) {
	        try {
	            if (dbData == null || dbData.isBlank()) return List.of();
	            JavaType t = M.getTypeFactory().constructCollectionType(List.class, LatLng.class);
	            return M.readValue(dbData, t);
	        } catch (Exception e) { throw new IllegalArgumentException("deserialize List<LatLng>", e); }
	    }
}
