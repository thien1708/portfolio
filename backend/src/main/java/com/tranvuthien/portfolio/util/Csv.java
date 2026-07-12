package com.tranvuthien.portfolio.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Tech stacks and typing roles are stored as comma-separated TEXT columns so
 * the same schema works on both PostgreSQL (Supabase) and H2 (local profile).
 */
public final class Csv {

    private Csv() {
    }

    public static List<String> toList(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public static String toCsv(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }
}
