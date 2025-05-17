package kazikd.dev.server.Unit;

import kazikd.dev.server.ControllerException.InvalidGoogleTokenException;
import kazikd.dev.server.ControllerException.InvalidRefreshTokenException;
import kazikd.dev.server.ControllerException.InvalidUserDataException;
import kazikd.dev.server.ControllerException.UserNotFoundException;
import kazikd.dev.server.Model.RefreshEntity;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import kazikd.dev.server.Service.JwtService;
import kazikd.dev.server.Service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepo userRepo;

    @Mock
    private JwtService jwtService;

    @Mock
    private GoogleIdToken.Payload payload;

    @InjectMocks
    private UserService userService;

    private final String dummyEmail = "email@email.com";
    private final String dummyPassword = "password";
    private final User dummyUser = new User(dummyEmail, dummyPassword);
    private final String refreshToken = "refresh-token";
    private final String jwtToken = "jwt-token";
    private final String googleToken = "google-token";
    private final RefreshEntity tokens = new RefreshEntity(jwtToken, refreshToken);

    @Test
    void registerUser_withValidData_shouldRegisterSuccessfully() {
        String result = userService.registerUser(dummyUser);
        assertEquals("User registered successfully", result);
        verify(userRepo).save(dummyUser);
    }

    @Test
    void registerUser_withInvalidEmail_shouldThrowInvalidUserDataException() {
        User invalidEmailUser = new User("invalidEmail", "password");
        Exception e = assertThrows(InvalidUserDataException.class, () -> userService.registerUser(invalidEmailUser));
        assertEquals("Invalid email format", e.getMessage());
        verifyNoInteractions(userRepo);
    }

    @Test
    void registerUser_withInvalidPassword_shouldThrowInvalidUserDataException(){
        User invalidPasswordUser = new User(dummyEmail,"pass");
        Exception e = assertThrows(InvalidUserDataException.class, () -> userService.registerUser(invalidPasswordUser));
        assertEquals("Password must be at least 8 characters long", e.getMessage());
        verifyNoInteractions(userRepo);
    }

    @Test
    void loginUser_withCredentialsCorrect_shouldReturnTokens() {
        when(userRepo.findByEmail(dummyEmail)).thenReturn(dummyUser);
        when(jwtService.generateRefreshToken()).thenReturn(refreshToken);
        long refreshExpiry = 1000000L;
        when(jwtService.getRefreshExpirationTime()).thenReturn(refreshExpiry);
        when(jwtService.generateToken(dummyEmail)).thenReturn(jwtToken);

        RefreshEntity result = userService.loginUser(dummyUser);

        assertEquals(jwtToken, result.jwtToken());
        assertEquals(refreshToken, result.refreshToken());

        verify(authenticationManager).authenticate(new UsernamePasswordAuthenticationToken(dummyEmail, dummyPassword));
        verify(userRepo).findByEmail(dummyEmail);
        verify(jwtService).generateRefreshToken();
        verify(jwtService).generateToken(dummyEmail);
        verify(userRepo).save(dummyUser);

        assertNotNull(dummyUser.getRefreshTokenExpiry());
    }

    @Test
    void loginUser_whenAuthenticationFails_shouldThrowAuthenticationException  () {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException(""));

        assertThrows(AuthenticationException.class, () -> userService.loginUser(dummyUser));
        verify(authenticationManager).authenticate(any());
        verifyNoMoreInteractions(userRepo, jwtService);
    }

    private User buildUser(String token, LocalDateTime expiry) {
        User user = new User(dummyEmail, dummyPassword);
        user.setRefreshToken(token);
        user.setRefreshTokenExpiry(expiry);
        return user;
    }

    @Test
    void refreshToken_withValid_shouldReturnNewJwtToken() {
        when(jwtService.extractUserEmail(jwtToken)).thenReturn(dummyEmail);
        User user = buildUser(refreshToken, LocalDateTime.now().plusHours(1));
        when(userRepo.findByEmail(dummyEmail)).thenReturn(user);
        when(jwtService.generateToken(dummyEmail)).thenReturn("new-jwt-token");

        String result = userService.refreshToken(tokens);

        assertEquals("new-jwt-token", result);
        verify(jwtService).extractUserEmail(jwtToken);
        verify(userRepo).findByEmail(dummyEmail);
        verify(jwtService).generateToken(dummyEmail);
    }

    @Test
    void refreshToken_withJwtInvalid_shouldThrowInvalidRefreshTokenException() {
        when(jwtService.extractUserEmail(jwtToken)).thenThrow(new RuntimeException(""));

        Exception e = assertThrows(InvalidRefreshTokenException.class,
                () -> userService.refreshToken(tokens));
        assertEquals("Invalid JWT token", e.getMessage());
    }

    @Test
    void refreshToken_withUserNotFound_shouldThrowUserNotFoundException() {
        when(jwtService.extractUserEmail(jwtToken)).thenReturn(dummyEmail);
        when(userRepo.findByEmail(dummyEmail)).thenReturn(null);

        Exception e = assertThrows(UserNotFoundException.class,
                () -> userService.refreshToken(tokens));
        assertEquals("User not found", e.getMessage());
    }

    @Test
    void refreshToken_withRefreshTokenExpired_shouldThrowInvalidRefreshTokenException() {
        when(jwtService.extractUserEmail(jwtToken)).thenReturn(dummyEmail);
        User user = buildUser(refreshToken, LocalDateTime.now().minusHours(1));
        when(userRepo.findByEmail(dummyEmail)).thenReturn(user);

        InvalidRefreshTokenException e = assertThrows(InvalidRefreshTokenException.class,
                () -> userService.refreshToken(tokens));
        assertEquals("Invalid or expired refresh token", e.getMessage());
    }

    @Test
    void refreshToken_withRefreshTokenInvalid_shouldThrowInvalidRefreshTokenException() {
        when(jwtService.extractUserEmail(jwtToken)).thenReturn(dummyEmail);
        User user = buildUser("invalid-refresh-token", LocalDateTime.now().plusHours(1));
        when(userRepo.findByEmail(dummyEmail)).thenReturn(user);

        Exception e = assertThrows(InvalidRefreshTokenException.class,
                () -> userService.refreshToken(tokens));
        assertEquals("Invalid or expired refresh token", e.getMessage());
    }

    private void setupGoogleMocks() {
        when(jwtService.getRefreshExpirationTime()).thenReturn(3600000L);
        when(jwtService.generateRefreshToken()).thenReturn(refreshToken);
        when(jwtService.generateToken(dummyEmail)).thenReturn(jwtToken);
        when(payload.getEmail()).thenReturn(dummyEmail);
    }

    @Test
    void googleLogin_withUserExists_shouldUpdateAndReturnTokens() {
        setupGoogleMocks();
        when(jwtService.verifyGoogleToken(googleToken)).thenReturn(payload);
        User user = new User(dummyEmail, dummyPassword);
        when(userRepo.findByEmail(dummyEmail)).thenReturn(user);

        RefreshEntity result = userService.googleLogin(googleToken);

        assertEquals(jwtToken, result.jwtToken());
        assertEquals(refreshToken, result.refreshToken());

        verify(userRepo).save(user);
        assertNotNull(user.getRefreshTokenExpiry());
        assertEquals(refreshToken, user.getRefreshToken());
    }

    @Test
    void googleLogin_withNewUser_shouldCreateUserAndReturnTokens() {
        setupGoogleMocks();
        when(jwtService.verifyGoogleToken(googleToken)).thenReturn(payload);
        when(userRepo.findByEmail(dummyEmail)).thenReturn(null);

        RefreshEntity result = userService.googleLogin(googleToken);

        assertEquals(jwtToken, result.jwtToken());
        assertEquals(refreshToken, result.refreshToken());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepo).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals(dummyEmail, savedUser.getEmail());
        assertNotNull(savedUser.getPassword());
        assertNotNull(savedUser.getRefreshToken());
        assertNotNull(savedUser.getRefreshTokenExpiry());
    }

    @Test
    void googleLogin_withTokenInvalid_shouldThrowInvalidGoogleTokenException() {
        when(jwtService.verifyGoogleToken("invalid-token")).thenReturn(null);

        Exception e = assertThrows(InvalidGoogleTokenException.class,
                () -> userService.googleLogin("invalid-token"));

        assertEquals("Invalid Google token", e.getMessage());
        verify(userRepo, never()).save(any());
    }

    @Test
    void logout_whenCalled_shouldClearTokensAndLogout  () {
        when(userRepo.findByEmail(dummyEmail)).thenReturn(dummyUser);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(dummyEmail, dummyPassword));
        userService.logout();

        assertNull(dummyUser.getRefreshToken());
        assertNull(dummyUser.getRefreshTokenExpiry());

        verify(userRepo).save(dummyUser);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

}