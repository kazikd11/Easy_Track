package kazikd.dev.server.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepo userRepo;

    private final String dummyEmail = "email@email.com";
    private final String dummyPassword = "password";

    @BeforeEach
    void setUp() {
        userRepo.deleteAll();
    }

    private <T> void performPost(String url, T body, int expectedStatus, String expectedMessage) throws Exception {
        mockMvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.message").value(expectedMessage));
    }

    @Test
    void registerUser_withValidData_shouldReturn201() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPost("/auth/register", user, 201, "User registered successfully");

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());

        assertNotEquals(dummyPassword, users.getFirst().getPassword());
        assertNotNull(users.getFirst().getPassword());
    }

    @Test
    void registerUser_withInvalidEmail_shouldReturn400() throws Exception {
        User user = new User("email", dummyPassword);
        performPost("/auth/register", user, 400, "Invalid email format");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_withInvalidPassword_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, "pass");
        performPost("/auth/register", user, 400, "Password must be at least 8 characters long");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_whenEmailAlreadyExists_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, dummyPassword);
        userRepo.save(user);

        User duplicate = new User(dummyEmail, dummyPassword);

        performPost("/auth/register", duplicate, 400, "User already exists");
        assertEquals(1, userRepo.count());

    }
}