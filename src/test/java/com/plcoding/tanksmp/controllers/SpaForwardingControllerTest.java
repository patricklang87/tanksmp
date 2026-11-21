package com.plcoding.tanksmp.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SpaForwardingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void clientRouteForwardsToIndexHtml() throws Exception {
        mockMvc.perform(get("/match"))
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void nestedClientRouteForwardsToIndexHtml() throws Exception {
        mockMvc.perform(get("/match/abc123"))
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void unknownApiPathIsNotForwarded() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(forwardedUrl(null))
                .andExpect(status().isNotFound());
    }

    @Test
    void apiRootIsNotForwarded() throws Exception {
        mockMvc.perform(get("/api"))
                .andExpect(forwardedUrl(null));
    }

    @Test
    void assetPathIsNotForwarded() throws Exception {
        mockMvc.perform(get("/assets/missing.js"))
                .andExpect(forwardedUrl(null))
                .andExpect(status().isNotFound());
    }
}
