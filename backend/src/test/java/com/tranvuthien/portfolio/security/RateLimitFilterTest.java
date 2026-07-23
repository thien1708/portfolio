package com.tranvuthien.portfolio.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private final RateLimitFilter filter =
            new RateLimitFilter(new ObjectMapper().findAndRegisterModules());

    @Test
    void spoofedForwardedForHeaderCannotBypassTheLoginLimit() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertThat(login("10.0.0.1", "1.2.3." + i).getStatus()).isEqualTo(200);
        }
        // 6th request claims yet another forged client IP — must still be limited
        assertThat(login("10.0.0.1", "9.9.9.9").getStatus()).isEqualTo(429);
    }

    @Test
    void differentClientAddressesGetIndependentBuckets() throws Exception {
        for (int i = 0; i < 5; i++) {
            login("10.0.0.1", null);
        }
        assertThat(login("10.0.0.1", null).getStatus()).isEqualTo(429);
        assertThat(login("10.0.0.2", null).getStatus()).isEqualTo(200);
    }

    private MockHttpServletResponse login(String remoteAddr, String forwardedFor) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr(remoteAddr);
        if (forwardedFor != null) {
            request.addHeader("X-Forwarded-For", forwardedFor);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
