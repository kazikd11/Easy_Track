package kazikd.dev.server.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import kazikd.dev.server.Model.RefreshEntity;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Repository.SyncRepo;
import kazikd.dev.server.Repository.UserRepo;
import kazikd.dev.server.Service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static kazikd.dev.server.Helpers.PerformHelpers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerActionsIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SyncRepo syncRepo;

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

    // endpoint login - generates and saves refresh token in db
    private RefreshEntity registerLoginGetTokens() throws Exception {
        userRepo.save(new User(dummyEmail, dummyEncryptedPassword));
        User user = new User(dummyEmail, dummyPassword);
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readValue(response, RefreshEntity.class);
    }

    @Test
    void deleteUser_whenCalled_shouldRemoveUserAndEntries() throws Exception {
        User user = userRepo.save(new User(dummyEmail, dummyEncryptedPassword));
        String jwt =  jwtService.generateToken(dummyEmail);
        WeightEntry entry = new WeightEntry(LocalDate.now(), 80.0, user);
        syncRepo.save(entry);

        assertEquals(1, syncRepo.count());

        performDeleteCheckMessage(mockMvc,"/auth/delete", jwt, "User deleted successfully");

        assertFalse(userRepo.existsById(user.getId()));
        assertEquals(0, syncRepo.count());
    }

    @Test
    void deleteUser_whenMoreUsers_shouldNotDeleteOtherUsersData() throws Exception {
        User userA = userRepo.save(new User(dummyEmail, dummyEncryptedPassword));
        String jwtA = jwtService.generateToken(dummyEmail);
        WeightEntry entryA = new WeightEntry(LocalDate.now(), 80.0, userA);
        syncRepo.save(entryA);

        String emailB = "other@email.com";
        User userB = userRepo.save(new User(emailB, dummyEncryptedPassword));
        WeightEntry entryB = new WeightEntry(LocalDate.now(), 80.0, userB);
        syncRepo.save(entryB);

        assertEquals(2, syncRepo.count());

        performDeleteCheckMessage(mockMvc,"/auth/delete", jwtA, "User deleted successfully");

        assertFalse(userRepo.existsById(userA.getId()));
        assertTrue(userRepo.existsById(userB.getId()));

        assertEquals(1, syncRepo.count());
        List<WeightEntry> savedEntries = syncRepo.findByUser(userB);
        assertEquals(1, savedEntries.size());
    }


    @Test
    void logout_shouldClearRefreshTokenAndReturn200() throws Exception {
        RefreshEntity tokens = registerLoginGetTokens();

        performDeleteCheckMessage(mockMvc,"/auth/logout", tokens.jwtToken(), "Logged out successfully");

        User user = userRepo.findByEmail(dummyEmail);
        assertNull(user.getRefreshToken());
        assertNull(user.getRefreshTokenExpiry());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void refreshToken_withValidTokens_shouldReturnNewJwt() throws Exception {
        RefreshEntity tokens = registerLoginGetTokens();

        Thread.sleep(1000);

        performPostCheckJwt(mockMvc, objectMapper,"/auth/refresh", tokens, tokens.jwtToken());
    }

    @Test
    void refreshToken_withExpiredJwt_shouldReturnNewJwt() throws Exception {
        ReflectionTestUtils.setField(jwtService, "expirationTime", -1L);
        RefreshEntity tokens = registerLoginGetTokens();
        ReflectionTestUtils.setField(jwtService, "expirationTime", 100000000L);

        Thread.sleep(1000);

        performPostCheckJwt(mockMvc, objectMapper,"/auth/refresh", tokens, tokens.jwtToken());
    }

    @Test
    void refreshToken_withInvalidRefreshToken_shouldReturn401() throws Exception {
        RefreshEntity tokens = registerLoginGetTokens();

        RefreshEntity invalidRefresh = new RefreshEntity(tokens.jwtToken(), "refresh-token");

        performPostCheckMessage(mockMvc, objectMapper,"/auth/refresh", invalidRefresh, 401, "Invalid or expired refresh token");
    }

    @Test
    void refreshToken_withNonExistentUser_shouldReturn404() throws Exception {
        RefreshEntity tokens = registerLoginGetTokens();
        userRepo.deleteAll();

        performPostCheckMessage(mockMvc, objectMapper,"/auth/refresh", tokens, 404, "User not found");
    }

    @Test
    void refreshToken_withInvalidJwt_shouldReturn401() throws Exception {
        RefreshEntity tokens = registerLoginGetTokens();

        RefreshEntity invalidJwt = new RefreshEntity("jwt-token", tokens.refreshToken());

        performPostCheckMessage(mockMvc, objectMapper,"/auth/refresh", invalidJwt, 401, "Invalid or expired JWT token");
    }
}
