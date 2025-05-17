package kazikd.dev.server.unit;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import kazikd.dev.server.ControllerException.InvalidGoogleTokenException;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.UserPrincipal;
import kazikd.dev.server.Service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private GoogleIdTokenVerifier dummyVerifier;

    @Mock
    private GoogleIdToken dummyGoogleIdToken;

    @InjectMocks
    private JwtService jwtService;

    private final String dummyEmail = "email@email.com";
    private final User dummyUser = new User(dummyEmail, "password");
    private final UserDetails dummyUserDetails = new UserPrincipal(dummyUser);
    private final String dummyGoogleToken = "google-token";

    @BeforeEach
    void setUp() {
        String dummySecretKey = "devkey123devkey123devkey123devkey123devkey123devkey123";

        ReflectionTestUtils.setField(jwtService, "secretKey", Base64.getEncoder().encodeToString(dummySecretKey.getBytes()));
        ReflectionTestUtils.setField(jwtService, "expirationTime", 1000000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpirationTime", 1000000L);
        ReflectionTestUtils.setField(jwtService, "googleClientId", "test-client-id");
        ReflectionTestUtils.setField(jwtService, "googleIdTokenVerifier", dummyVerifier);
    }

    @Test
    void generateToken_withValidEmail_shouldReturnToken() {
        String token = jwtService.generateToken(dummyEmail);
        assertNotNull(token);
        assertTrue(token.startsWith("eyJ"));
    }

    @Test
    void validateToken_withValidTokenAndMatchingUser_shouldReturnTrue() {
        String token = jwtService.generateToken(dummyEmail);
        assertTrue(jwtService.validateToken(token, dummyUserDetails));
    }

    @Test
    void validateToken_withInvalidTokenFormat_shouldThrowSignatureException() {
        String token = jwtService.generateToken(dummyEmail);
        assertThrows(SignatureException.class, () -> jwtService.validateToken(token + "invalid", dummyUserDetails));
    }

    @Test
    void validateToken_withMismatchedUser_shouldReturnFalse() {
        String token = jwtService.generateToken(dummyEmail);
        UserDetails invalidUserDetails = new UserPrincipal(new User("invalidEmail", "password"));
        assertFalse(jwtService.validateToken(token, invalidUserDetails));
    }

    @Test
    void validateToken_withExpiredToken_shouldThrowExpiredJwtException() {
        ReflectionTestUtils.setField(jwtService, "expirationTime", -1L);
        String token = jwtService.generateToken(dummyEmail);
        assertThrows(ExpiredJwtException.class, () -> jwtService.validateToken(token, dummyUserDetails));
    }

    @Test
    void verifyGoogleToken_withValidToken_shouldReturnPayload() throws Exception {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(dummyEmail);

        when(dummyVerifier.verify(dummyGoogleToken)).thenReturn(dummyGoogleIdToken);
        when(dummyGoogleIdToken.getPayload()).thenReturn(payload);

        GoogleIdToken.Payload result = jwtService.verifyGoogleToken(dummyGoogleToken);

        assertNotNull(result);
        assertEquals(dummyEmail, result.getEmail());
    }

    @Test
    void verifyGoogleToken_withNullFromVerifier_shouldReturnNull() throws Exception {
        when(dummyVerifier.verify(dummyGoogleToken)).thenReturn(null);

        assertNull(jwtService.verifyGoogleToken(dummyGoogleToken));
    }

    @Test
    void verifyGoogleToken_whenVerifierThrowsException_shouldThrowInvalidGoogleTokenException() throws Exception {
        when(dummyVerifier.verify(dummyGoogleToken)).thenThrow(new RuntimeException(""));

        assertThrows(InvalidGoogleTokenException.class, () ->
                jwtService.verifyGoogleToken(dummyGoogleToken));
    }
}