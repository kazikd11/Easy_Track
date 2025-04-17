package kazikd.dev.server.Service;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private UserRepo userRepo;
    private BCryptPasswordEncoder passEncryptor;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
        this.passEncryptor = new BCryptPasswordEncoder(12);
    }

    public String registerUser(User user) {
        String encryptedPassword = passEncryptor.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepo.save(user);
        return "User registered successfully";
    }

    public String loginUser(User user) {

        //
        return "User logged in successfully";
    }

}
