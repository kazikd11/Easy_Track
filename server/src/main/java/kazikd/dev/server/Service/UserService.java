package kazikd.dev.server.Service;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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


    public String registerUser(User user) {
        String encryptedPassword = passEncryptor.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepo.save(user);
        return "User registered successfully";
    }

    public String loginUser(User user) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        return jwtService.generateToken(user.getEmail());
    }

    public void deleteUser() {
        userRepo.delete(getCurrentAuthenticatedUser());
    }
}
