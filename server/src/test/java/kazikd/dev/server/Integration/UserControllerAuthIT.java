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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static kazikd.dev.server.Helpers.PerformHelpers.performPostCheckMessage;
import static kazikd.dev.server.Helpers.PerformHelpers.performPostCheckTokens;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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

    @Test
    void registerUser_withValidData_shouldReturn201() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPostCheckMessage(mockMvc, objectMapper, "/auth/register", user, 201, "User registered successfully");

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
        performPostCheckMessage(mockMvc, objectMapper,"/auth/register", user, 400, "Invalid email format");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_withInvalidPassword_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, "pass");
        performPostCheckMessage(mockMvc, objectMapper,"/auth/register", user, 400, "Password must be at least 8 characters long");
        assertEquals(0, userRepo.count());
    }

    @Test
    void registerUser_whenEmailAlreadyExists_shouldReturn400() throws Exception {
        User user = new User(dummyEmail, dummyPassword);
        userRepo.save(user);

        User duplicate = new User(dummyEmail, dummyPassword);

        performPostCheckMessage(mockMvc, objectMapper,"/auth/register", duplicate, 400, "User already exists");
        assertEquals(1, userRepo.count());
    }

    @Test
    void loginUser_withValidCredentials_shouldReturn200AndTokens() throws Exception {
        User user = new User(dummyEmail, dummyPassword);
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));

        performPostCheckTokens(mockMvc, objectMapper,"/auth/login", user);

        assertNotNull(userRepo.findByEmail(dummyEmail).getRefreshToken());
        assertNotNull(userRepo.findByEmail(dummyEmail).getRefreshTokenExpiry());
    }

    @Test
    void loginUser_withWrongPassword_shouldReturn401() throws Exception {
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));

        User user = new User(dummyEmail, "wrongPassword");

        performPostCheckMessage(mockMvc, objectMapper,"/auth/login", user, 401, "Invalid credentials");
    }

    @Test
    void loginUser_withNonExistingEmail_shouldReturn401() throws Exception {
        User user = new User(dummyEmail, dummyPassword);

        performPostCheckMessage(mockMvc, objectMapper,"/auth/login", user, 401, "Invalid credentials");
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

        performPostCheckTokens(mockMvc, objectMapper,"/auth/google", new GoogleAuthToken("google-token"));

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());
    }

    @Test
    void google_withExistingUser_shouldNotCreateUserAndReturnTokens() throws Exception {
        userRepo.save(new User(dummyEmail, dummyPassword));

        mockGoogleVerifier();

        performPostCheckTokens(mockMvc, objectMapper,"/auth/google", new GoogleAuthToken("google-token"));

        List<User> users = userRepo.findAll();
        assertEquals(1, users.size());
        assertEquals(dummyEmail, users.getFirst().getEmail());
    }

    @Test
    void google_verifierReturnNull_shouldReturn401() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", verifier);
        when(verifier.verify("google-token")).thenReturn(null);

        performPostCheckMessage(mockMvc, objectMapper,"/auth/google", new GoogleAuthToken("google-token"), 401, "Invalid Google token");

        assertEquals(0, userRepo.count());
    }

    @Test
    void google_verifierThrowsException_shouldReturn401() throws Exception {
        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", verifier);
        when(verifier.verify("google-token")).thenThrow(new RuntimeException(""));

        performPostCheckMessage(mockMvc, objectMapper,"/auth/google", new GoogleAuthToken("google-token"), 401, "Failed to verify Google token");

        assertEquals(0, userRepo.count());
    }


}