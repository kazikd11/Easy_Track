package kazikd.dev.server.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import kazikd.dev.server.ControllerException.InvalidRefreshTokenException;
import kazikd.dev.server.ControllerException.InvalidUserDataException;
import kazikd.dev.server.ControllerException.UserNotFoundException;
import kazikd.dev.server.Model.RefreshEntity;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final AuthenticationManager authenticationManager;
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passEncryptor;
    private final JwtService jwtService;

    public UserService(UserRepo userRepo, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepo = userRepo;
        this.passEncryptor = new BCryptPasswordEncoder(12);
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public User getCurrentAuthenticatedUser() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
    }

    private void validateUserData(User user) {
        if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new InvalidUserDataException("Invalid email format");
        }

        if (user.getPassword() == null || user.getPassword().length() < 8) {
            throw new InvalidUserDataException("Password must be at least 8 characters long");
        }
    }

    public String registerUser(User user) {
        validateUserData(user);
        String encryptedPassword = passEncryptor.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepo.save(user);
        return "User registered successfully";
    }

    public RefreshEntity loginUser(User user) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        User dbuser = userRepo.findByEmail(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken();
        dbuser.setRefreshToken(refreshToken);
        dbuser.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpirationTime())));
        userRepo.save(dbuser);

        String jwtToken = jwtService.generateToken(user.getEmail());

        return new RefreshEntity(jwtToken, refreshToken);
    }

    public void deleteUser() {
        userRepo.delete(getCurrentAuthenticatedUser());
    }

    public RefreshEntity googleLogin(String token) {
        GoogleIdToken.Payload payload = jwtService.verifyGoogleToken(token);
        if (payload == null) {
            throw new RuntimeException("Invalid Google token");
        }

        String email = payload.getEmail();
        User user = userRepo.findByEmail(email);
        if (user == null) {
            user = new User(email, passEncryptor.encode(UUID.randomUUID().toString()));
        }

        String refreshToken = jwtService.generateRefreshToken();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpirationTime())));
        userRepo.save(user);

        String jwtToken = jwtService.generateToken(email);

        return new RefreshEntity(jwtToken, refreshToken);
    }


    public String refreshToken(RefreshEntity tokens) {
        String refreshToken = tokens.refreshToken();
        String jwtToken = tokens.jwtToken();

        String email;
        try {
            email = jwtService.extractUserEmail(jwtToken);
        } catch (Exception e) {
            throw new InvalidRefreshTokenException("Invalid JWT token");
        }

        User user = userRepo.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }

        if (user.isRefreshTokenExpired() || !refreshToken.equals(user.getRefreshToken())) {
            throw new InvalidRefreshTokenException("Invalid or expired refresh token");
        }

        return jwtService.generateToken(email);
    }
}
