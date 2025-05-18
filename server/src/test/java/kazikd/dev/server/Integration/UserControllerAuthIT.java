package kazikd.dev.server.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import kazikd.dev.server.Model.GoogleAuthToken;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import kazikd.dev.server.Service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerAuthIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtService jwtService;

    private final BCryptPasswordEncoder passEncryptor = new BCryptPasswordEncoder(12);

    private final String dummyEmail = "email@email.com";
    private final String dummyPassword = "password";
    private final String dummyEncryptedPassword = passEncryptor.encode(dummyPassword);

    @BeforeEach
    void setUp() {
        userRepo.deleteAll();
    }

    private <T> void performPostGetMessage(String url, T body, int expectedStatus, String expectedMessage) throws Exception {
        mockMvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.message").value(expectedMessage));
    }

    private <T> void performPostGetTokens(String url, T body, int expectedStatus) throws Exception {
        mockMvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is(expectedStatus))
                .andExpect(jsonPath("$.jwtToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void registerUser_withValidData_shouldReturn201() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPostGetMessage("/auth/register", user, 201, "User registered successfully");

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
        performPostGetMessage("/auth/register", user, 400, "Invalid email format");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_withInvalidPassword_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, "pass");
        performPostGetMessage("/auth/register", user, 400, "Password must be at least 8 characters long");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_whenEmailAlreadyExists_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, dummyPassword);
        userRepo.save(user);

        User duplicate = new User(dummyEmail, dummyPassword);

        performPostGetMessage("/auth/register", duplicate, 400, "User already exists");
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

        performPostGetMessage("/auth/login", user, 401, "Invalid credentials");
    }

    @Test
    void loginUser_withNonExistingEmail_shouldReturn401() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPostGetMessage("/auth/login", user, 401, "Invalid credentials");
    }

    private void mockGoogleVerifier() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", verifier);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(dummyEmail);
        GoogleIdToken mockToken = mock(GoogleIdToken.class);
        when(mockToken.getPayload()).thenReturn(payload);
        when(verifier.verify("google-token")).thenReturn(mockToken);
    }

    @Test
    void google_withNewUser_shouldCreateUserAndReturnTokens() throws Exception {
        mockGoogleVerifier();

        performPostGetTokens("/auth/google", new GoogleAuthToken("google-token"), 200);

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());
    }

    @Test
    void google_withExistingUser_shouldNotCreateUserAndReturnTokens() throws Exception {
        userRepo.save(new User(dummyEmail, dummyPassword));

        mockGoogleVerifier();

        performPostGetTokens("/auth/google", new GoogleAuthToken("google-token"), 200);

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());
    }

    @Test
    void google_verifierReturnNull_shouldReturn401() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", verifier);
        when(verifier.verify("google-token")).thenReturn(null);

        performPostGetMessage("/auth/google", new GoogleAuthToken("google-token"), 401, "Invalid Google token");

        assertEquals(0, userRepo.count());
    }

    @Test
    void google_verifierThrowsException_shouldReturn401() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", verifier);
        when(verifier.verify("google-token")).thenThrow(new RuntimeException(""));

        performPostGetMessage("/auth/google", new GoogleAuthToken("google-token"), 401, "Failed to verify Google token");

        assertEquals(0, userRepo.count());
    }


}