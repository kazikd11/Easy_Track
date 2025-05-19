package kazikd.dev.server.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import kazikd.dev.server.Model.WeightEntryDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthorizationIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void syncToCloud_withoutJwt_shouldReturnUnauthorized() throws Exception {

        List<WeightEntryDTO> dummyEntry = List.of(
                new WeightEntryDTO(LocalDate.of(2025, 1, 1), 80.0)
        );

        mockMvc.perform(post("/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dummyEntry)))
                .andExpect(status().isForbidden());
    }

    @Test
    void syncFromCloud_withoutJwt_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/sync"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteAllUserEntries_withoutJwt_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/sync"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logout_withoutJwt_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/auth/logout"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteUser_withoutJwt_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/auth/delete"))
                .andExpect(status().isForbidden());
    }
}
