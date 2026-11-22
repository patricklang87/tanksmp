package com.plcoding.tanksmp.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Loads the real application.properties to verify that, behind a TLS-terminating proxy such as
 * Render's, requests from the app's own https origin are accepted and foreign origins are rejected.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SameOriginBehindProxyTest {

    private static final String PUBLIC_HOST = "tanks.example.onrender.com";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void sameOriginHttpsRequestBehindProxyIsAllowed() throws Exception {
        mockMvc.perform(post("/api/matches")
                        .header(HttpHeaders.HOST, PUBLIC_HOST)
                        .header(HttpHeaders.ORIGIN, "https://" + PUBLIC_HOST)
                        .header("X-Forwarded-Proto", "https"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void foreignOriginBehindProxyIsRejected() throws Exception {
        mockMvc.perform(post("/api/matches")
                        .header(HttpHeaders.HOST, PUBLIC_HOST)
                        .header(HttpHeaders.ORIGIN, "https://evil.example.com")
                        .header("X-Forwarded-Proto", "https"))
                .andExpect(status().isForbidden());
    }
}
