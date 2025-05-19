package kazikd.dev.server.Helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hamcrest.Matchers;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PerformHelpers {

    public static <T> void performPostCheckMessage(MockMvc mockMvc, ObjectMapper objectMapper,
                                                   String url, T body, int expectedStatus, String expectedMessage) throws Exception {
        mockMvc.perform(post(url)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.message").value(expectedMessage));
    }

    public static <T> void performPostWithAuthHeaderCheckMessage(MockMvc mockMvc, ObjectMapper objectMapper,
                                                   String url, String jwt, T body, int expectedStatus, String expectedMessage) throws Exception {
        mockMvc.perform(post(url)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.message").value(expectedMessage));
    }

    public static <T> void performPostCheckJwt(MockMvc mockMvc, ObjectMapper objectMapper,
                                               String url, T body, String oldJwt) throws Exception {
        mockMvc.perform(post(url)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.message").value(Matchers.not(oldJwt)));
    }

    public static <T> void performPostCheckTokens(MockMvc mockMvc, ObjectMapper objectMapper,
                                                  String url, T body) throws Exception {
        mockMvc.perform(post(url)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwtToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    public static void performDeleteCheckMessage(MockMvc mockMvc,
                                                 String url, String bearer, String expectedMessage) throws Exception {
        mockMvc.perform(delete(url)
                        .header("Authorization", "Bearer " + bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(expectedMessage));
    }
}
