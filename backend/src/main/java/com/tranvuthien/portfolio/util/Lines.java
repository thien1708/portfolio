package com.tranvuthien.portfolio.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Gallery URLs and highlight bullets are stored as newline-separated TEXT
 * columns — unlike {@link Csv}, values here (URLs, prose) may legally
 * contain commas.
 */
public final class Lines {

    private Lines() {
    }

    public static List<String> toList(String joined) {
        if (joined == null || joined.isBlank()) {
            return List.of();
        }
        return Arrays.stream(joined.split("\\R"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public static String toJoined(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n"));
    }
}
