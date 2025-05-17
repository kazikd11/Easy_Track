package kazikd.dev.server.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Repository.SyncRepo;
import kazikd.dev.server.Repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
    private SyncRepo syncRepo;

    @Autowired
    private UserRepo userRepo;

    private final BCryptPasswordEncoder passEncryptor = new BCryptPasswordEncoder(12);

    private final String dummyEmail = "email@email.com";
    private final String dummyPassword = "password";
    private final String dummyEncryptedPassword = passEncryptor.encode(dummyPassword);

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

    private String registerLoginGetJwt() throws Exception {
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));
        User user = new User(dummyEmail, dummyPassword);
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return com.jayway.jsonpath.JsonPath.read(response, "$.jwtToken");
    }

    @Test
    void registerUser_withValidData_shouldReturn201() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPost("/auth/register", user, 201, "User registered successfully");

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());

        assertNotEquals(dummyPassword, users.getFirst().getPassword());
        assertTrue(passEncryptor.matches(dummyPassword, users.getFirst().getPassword()));
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

    @Test
    void loginUser_withValidCredentials_shouldReturn200AndTokens() throws Exception {
        User user = new User(dummyEmail, dummyPassword);
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwtToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());

        assertNotNull(userRepo.findByEmail(dummyEmail).getRefreshToken());
    }

    @Test
    void loginUser_withWrongPassword_shouldReturn401() throws Exception {
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));

        User user = new User(dummyEmail, "wrongPassword");

        performPost("/auth/login", user, 401, "Invalid credentials");
    }

    @Test
    void loginUser_withNonExistingEmail_shouldReturn401() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPost("/auth/login", user, 401, "Invalid credentials");
    }

    @Test
    void deleteUser_whenCalled_shouldRemoveUserAndEntries() throws Exception {
        String jwt = registerLoginGetJwt();
        User user = userRepo.findByEmail(dummyEmail);
        WeightEntry entry = new WeightEntry(LocalDate.now(), 80.0, user);
        syncRepo.save(entry);

        assertEquals(1, syncRepo.count());

        mockMvc.perform(delete("/auth/delete")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User deleted successfully"));

        assertFalse(userRepo.existsById(user.getId()));
        assertEquals(0, syncRepo.count());
    }

}